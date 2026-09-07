import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import Home from '@/pages/Home'

/**
 * Route ทั้งหมดตาม sitemap ที่ตกลงไว้
 *
 * Home ไม่ lazy เพราะเป็นทางเข้าหลักของเว็บ — การ split ทำให้ผู้ใช้ส่วนใหญ่
 * ต้องรออีกหนึ่ง round trip โดยไม่ได้อะไรกลับมา
 * หน้าอื่น lazy ทั้งหมดเพื่อคุม initial bundle ให้อยู่ใน budget (≤ 200KB gzip)
 */

const About = lazy(() => import('@/pages/About'))
const ServiceList = lazy(() => import('@/pages/ServiceList'))
const ServiceDetail = lazy(() => import('@/pages/ServiceDetail'))
const ProductList = lazy(() => import('@/pages/ProductList'))
const ProductDetail = lazy(() => import('@/pages/ProductDetail'))
const Brands = lazy(() => import('@/pages/Brands'))
const BrandDatasheets = lazy(() => import('@/pages/BrandDatasheets'))
const Reference = lazy(() => import('@/pages/Reference'))
const ProjectList = lazy(() => import('@/pages/ProjectList'))
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'))
const NewsList = lazy(() => import('@/pages/NewsList'))
const NewsDetail = lazy(() => import('@/pages/NewsDetail'))
const Careers = lazy(() => import('@/pages/Careers'))
const Contact = lazy(() => import('@/pages/Contact'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const StyleGuide = lazy(() => import('@/pages/StyleGuide'))

/**
 * หลังบ้าน — lazy ทุกหน้าเหมือนกัน แต่สำคัญกว่าหน้าอื่น
 *
 * ผู้เข้าชมเว็บ 99.9% ไม่มีวันเปิด /admin การ split ทำให้โค้ดฟอร์ม ตัวอัปโหลด
 * และตารางจัดการทั้งหมดไม่ถูกดาวน์โหลดโดยคนที่มาอ่านข้อมูลบริการ
 * (ยังอยู่ในงบ initial JS ≤ 200KB gzip ตามที่ตั้งไว้ตั้งแต่ Phase 1)
 */
const AdminShell = lazy(() => import('@/pages/admin/AdminShell'))
const AdminLogin = lazy(() => import('@/pages/admin/Login'))
const AdminNewsList = lazy(() => import('@/pages/admin/NewsList'))
const AdminNewsEdit = lazy(() => import('@/pages/admin/NewsEdit'))
const AdminProjectList = lazy(() => import('@/pages/admin/ProjectList'))
const AdminProjectEdit = lazy(() => import('@/pages/admin/ProjectEdit'))
const AdminSiteReferenceList = lazy(() => import('@/pages/admin/SiteReferenceList'))
const AdminSiteReferenceEdit = lazy(() => import('@/pages/admin/SiteReferenceEdit'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'services', element: <ServiceList /> },
      { path: 'services/:slug', element: <ServiceDetail /> },

      /**
       * URL เก่าที่เลิกใช้แล้ว — ต้องพาไปหน้าใหม่ ไม่ใช่เด้ง 404
       *
       * `network-cctv-system` เคยเป็นบริการเดียวที่รวมงานเครือข่ายกับกล้องวงจรปิด
       * ตอนนี้แยกเป็น `network-system` กับ `cctv-system` แล้ว เลือกให้ไปที่หน้ากล้อง
       * เพราะเนื้อหาส่วนใหญ่ของหน้าเดิม (ขั้นตอนทำงาน ข้อมูลเสนอราคา ประเด็นเทคนิค
       * สองในสามข้อ) ย้ายไปอยู่ที่นั่น
       *
       * `explosion-proof-telephone-signalling` เปลี่ยนชื่อเป็น `telephone-system`
       * ตาม Company Profile ที่จัดงานนี้เป็น Telephone System เต็มระบบ
       * ไม่ใช่แค่การจัดจำหน่ายเครื่องกันระเบิด — เนื้อหาเดิมทั้งหมดย้ายตามไปด้วย
       *
       *
       * ทางฝั่งเซิร์ฟเวอร์มีตัวเดียวกันนี้ตอบ 301 ไว้ที่ `server/src/redirects.ts`
       * ให้คนที่เปิดลิงก์ตรง ๆ ได้สถานะที่ถูกต้อง — **แก้ที่ไหนต้องแก้อีกที่ด้วย**
       * ตัวนี้ยังจำเป็นอยู่ เพราะตอน dev ไม่มีเซิร์ฟเวอร์นั้นมาคั่น และการกดลิงก์
       * ภายในเว็บไม่ได้วิ่งผ่านเซิร์ฟเวอร์เลย
       */
      {
        path: 'services/network-cctv-system',
        element: <Navigate to="/services/cctv-system" replace />,
      },
      {
        path: 'services/explosion-proof-telephone-signalling',
        element: <Navigate to="/services/telephone-system" replace />,
      },
      { path: 'products', element: <ProductList /> },
      { path: 'products/:slug', element: <ProductDetail /> },
      { path: 'brands', element: <Brands /> },
      { path: 'brands/:brandId/datasheets', element: <BrandDatasheets /> },
      { path: 'reference', element: <Reference /> },
      { path: 'projects', element: <ProjectList /> },
      { path: 'projects/:slug', element: <ProjectDetail /> },
      { path: 'news', element: <NewsList /> },
      { path: 'news/:slug', element: <NewsDetail /> },
      { path: 'careers', element: <Careers /> },
      { path: 'contact', element: <Contact /> },

      // หน้าตรวจ design system — ไม่ควรหลุดขึ้น production
      ...(import.meta.env.DEV ? [{ path: 'styleguide', element: <StyleGuide /> }] : []),

      { path: '*', element: <NotFound /> },
    ],
  },

  /**
   * หลังบ้าน — อยู่นอก <Layout> ของหน้าเว็บสาธารณะโดยตั้งใจ
   *
   * ถ้าวางซ้อนใต้ Layout จะได้ header ที่มีเมนูหลัก ปุ่มสลับภาษา และ footer
   * ที่มีที่อยู่บริษัทติดมาด้วยทุกหน้าจัดการ ซึ่งไม่ได้ช่วยคนที่กำลังลงข่าว
   * และทำให้เมนูของสองระบบปนกันจนกดผิดได้ง่าย
   *
   * `/admin/login` แยกออกมาอีกชั้นเพราะต้องเปิดได้ตอน**ยังไม่ได้ล็อกอิน** —
   * ถ้าอยู่ใต้ AdminShell ซึ่งเป็นตัวเช็คสิทธิ์ จะกลายเป็นวนเด้งไม่รู้จบ
   */
  { path: '/admin/login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: <AdminShell />,
    children: [
      { index: true, element: <Navigate to="/admin/news" replace /> },
      { path: 'news', element: <AdminNewsList /> },
      { path: 'news/new', element: <AdminNewsEdit /> },
      { path: 'news/:id', element: <AdminNewsEdit /> },
      { path: 'projects', element: <AdminProjectList /> },
      { path: 'projects/new', element: <AdminProjectEdit /> },
      { path: 'projects/:id', element: <AdminProjectEdit /> },
      { path: 'site-references', element: <AdminSiteReferenceList /> },
      { path: 'site-references/new', element: <AdminSiteReferenceEdit /> },
      { path: 'site-references/:id', element: <AdminSiteReferenceEdit /> },
    ],
  },
])
