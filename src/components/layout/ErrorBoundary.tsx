import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * กันไม่ให้ component เดียวพังทั้งเว็บ
 *
 * เว็บองค์กรที่ขาวทั้งจอเพราะ section เดียว error คือความเสียหายต่อภาพลักษณ์
 * ที่รับไม่ได้ ยิ่งเมื่อ Phase 5 จะมี WebGL เข้ามา ซึ่งพังได้จากฝั่ง driver
 * ของเครื่องผู้ใช้เองโดยที่โค้ดเราไม่ผิด
 *
 * **การรีเซ็ตทำด้วย key จากฝั่งผู้เรียก** (Layout ส่ง pathname เป็น key)
 * ไม่ใช่ logic ในตัว boundary เอง — React จะ unmount/mount ใหม่ให้ทุกครั้งที่เปลี่ยนหน้า
 * ซึ่งได้ผลเดียวกันโดยไม่ต้องมี lifecycle เพิ่ม
 *
 * ถ้าไม่รีเซ็ต error ครั้งเดียวจะทำให้ boundary ค้างสถานะ error ตลอด ผู้ใช้กดไปหน้าอื่น
 * ก็ยังเห็นหน้า error ทั้งที่หน้านั้นไม่ได้พัง — boundary ที่ตั้งใจกันเว็บพังทั้งจอ
 * จะกลายเป็นตัวทำให้เว็บพังทั้งจอเสียเอง
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: ส่งเข้า error tracking จริงเมื่อมี (Phase ถัดไป)
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}
