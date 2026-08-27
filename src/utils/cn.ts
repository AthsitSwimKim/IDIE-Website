import clsx, { type ClassValue } from 'clsx'

/**
 * รวม className แบบมีเงื่อนไข
 *
 * โครงการนี้ไม่ใช้ tailwind-merge โดยตั้งใจ — primitive ทุกตัวคุม variant ของตัวเองอยู่แล้ว
 * ถ้าเริ่มต้องการ merge เพราะ class ชนกันบ่อย นั่นแปลว่า primitive ตัวนั้นเปิดให้ override
 * มากเกินไป ให้กลับไปแก้ที่ variant แทนการเพิ่ม dependency
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
