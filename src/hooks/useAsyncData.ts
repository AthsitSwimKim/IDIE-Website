import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  /**
   * ข้อความผิดพลาดเมื่อ loader ล้ม — `null` เมื่อสำเร็จหรือยังโหลดไม่เสร็จ
   *
   * มีตั้งแต่วันที่ข้อมูลยังอยู่ในเครื่อง เพราะตอนนี้ข่าวและผลงานมาจาก API จริงแล้ว
   * ถ้าไม่ดัก loader ที่ reject จะทำให้ `loading` ค้างเป็น true ตลอดกาล
   * ผู้ใช้เห็นสปินเนอร์หมุนไม่จบโดยไม่มีอะไรบอกว่าเกิดอะไรขึ้น
   */
  error: string | null
}

interface AsyncResult<T> extends AsyncState<T> {
  /**
   * เรียก loader ใหม่โดยไม่โหลดหน้าใหม่ทั้งหน้า
   *
   * มีไว้ให้ปุ่ม "ลองใหม่อีกครั้ง" บนสถานะโหลดไม่สำเร็จ — `location.reload()`
   * ทำงานได้เหมือนกันแต่ทิ้งทุกอย่างที่โหลดไว้แล้วและพาผู้ใช้กลับไปบนสุดของหน้า
   * ทั้งที่สิ่งที่ล้มคือคำขอเดียว
   */
  reload: () => void
}

/**
 * อ่านข้อมูลจาก accessor ที่เป็น async
 *
 * accessor ใน src/data ถูกทำเป็น async ตั้งแต่วันแรกทั้งที่ข้อมูลยังอยู่ในหน่วยความจำ
 * hook นี้จึงเป็นตัวกลางที่ทำให้ component ไม่ต้องรู้ว่าข้อมูลมาจากไหน —
 * วันที่ย้ายไป API หรือ CMS จริง component ไม่ต้องแก้เลย
 *
 * ยังไม่ใส่ cache หรือ dedupe เพราะข้อมูลอยู่ในเครื่องและยังไม่มีต้นทุนจริง
 * เมื่อต่อ API แล้วค่อยเปลี่ยนตรงนี้เป็น TanStack Query หรือ React 19 use() + cache
 *
 * **ข้อมูลในหน่วยความจำต้องอยู่ในเฟรมแรก** — เดิมโหลดใน useEffect ซึ่งทำงานหลังเบราว์เซอร์
 * วาดหน้าไปแล้ว ทุก section ที่ `return null` ระหว่างรอจึงหายไปหนึ่งเฟรมแล้วค่อยโผล่
 * ดันทุกอย่างด้านล่างลง (Lighthouse CLS 0.124 หน้าแรก / 0.151 หน้าสินค้า ทั้งที่ข้อมูลอยู่
 * ในไฟล์ JS ที่โหลดมาแล้ว) จึงย้ายมา useLayoutEffect ซึ่งทำงานก่อนวาด และถ้า loader
 * เสร็จก่อนเฟรมถัดไป (accessor ที่แค่ห่อข้อมูลในเครื่องด้วย async) ก็ flushSync ให้
 * DOM มีข้อมูลตั้งแต่เฟรมแรก งานเครือข่ายหรือ chunk ที่โหลดจริงยังเดินทางเดิมทุกอย่าง
 */
export function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[] = []): AsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null })

  /** ตัวนับที่เพิ่มค่าเพื่อบังคับให้ effect ทำงานซ้ำ โดยไม่ต้องแตะ deps ของผู้เรียก */
  const [attempt, setAttempt] = useState(0)
  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  /**
   * เก็บ loader ไว้ใน ref เพราะผู้เรียกมักส่ง arrow function ที่สร้างใหม่ทุก render
   * ถ้าใส่ลง dependency ตรง ๆ จะยิงซ้ำไม่จบ — สิ่งที่ควรกำหนดว่า "เมื่อไรควรโหลดใหม่"
   * คือ deps ที่ผู้เรียกประกาศเอง ไม่ใช่ตัวตนของฟังก์ชัน
   */
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  /** แปลง deps เป็น key เพื่อให้ dependency array เป็น literal ที่ตรวจสอบได้แบบ static */
  const depsKey = JSON.stringify(deps)

  useLayoutEffect(() => {
    let cancelled = false
    // คงข้อมูลเดิมไว้ระหว่างโหลดรอบใหม่ เพื่อไม่ให้หน้ากะพริบตอนเปลี่ยน filter
    // (คืน prev เมื่อสถานะไม่เปลี่ยน — ไม่งั้นจะ render ซ้ำเปล่า ๆ ทุกครั้งที่ mount)
    setState((prev) => (prev.loading && prev.error === null ? prev : { ...prev, loading: true, error: null }))

    // rAF ทำงานตอนเบราว์เซอร์กำลังจะวาดเฟรมถัดไป — ถ้า loader เสร็จก่อนนั้น ยังทัน
    // ใส่ข้อมูลลง DOM ก่อนผู้ใช้เห็นอะไรเลย
    let beforePaint = true
    const frame = requestAnimationFrame(() => {
      beforePaint = false
    })

    loaderRef.current().then(
      (data) => {
        if (cancelled) return
        const commit = () => setState({ data, loading: false, error: null })
        if (beforePaint) flushSync(commit)
        else commit()
      },
      (cause: unknown) => {
        if (cancelled) return
        // `loading: false` สำคัญกว่าตัวข้อความ — หน้าที่ไม่ได้อ่าน error จะได้แสดง
        // empty state ที่ออกแบบไว้แทนการค้างอยู่ที่สถานะกำลังโหลดไปเรื่อย ๆ
        setState({
          data: null,
          loading: false,
          error: cause instanceof Error ? cause.message : 'โหลดข้อมูลไม่สำเร็จ',
        })
      },
    )

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [depsKey, attempt])

  return { ...state, reload }
}
