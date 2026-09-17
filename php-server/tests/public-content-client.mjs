import { build } from 'vite'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
const out=resolve('tmp/public-content-client-test')
await build({configFile:false,publicDir:false,define:{'import.meta.env.VITE_API_DRIVER':'"php"'},build:{lib:{entry:resolve('src/utils/publicContent.ts'),formats:['es'],fileName:()=> 'client.mjs'},outDir:out,emptyOutDir:true,minify:false}})
const {fetchPublishedContent}=await import(pathToFileURL(resolve(out,'client.mjs')))
const passed=[]
const check=(label,value)=>{assert(value,label);passed.push(label)}
let calls=[]; let staticStatus=200; let expiresAt=null; let apiStatus=200; let serverDate='Wed, 16 Sep 2026 12:00:00 GMT'
const items=[{slug:'published',title:{th:'News',en:'News'}}]
globalThis.fetch=async(url,options)=>{
  calls.push({url,options})
  if(url.startsWith('/uploads/')) return new Response(JSON.stringify({version:1,kind:'news',expiresAt,items}),{status:staticStatus,headers:{Date:serverDate}})
  return new Response(JSON.stringify(items),{status:apiStatus})
}
const [list,detail]=await Promise.all([fetchPublishedContent('/api/news'),fetchPublishedContent('/api/news/published')])
check('Fresh static list and detail avoid PHP entirely',JSON.stringify(list)===JSON.stringify(items) && detail.slug==='published' && calls.length===1 && calls[0].url==='/uploads/content-cache/news.json')
check('Public static fetch omits session credentials',calls[0].options.credentials==='omit')
check('Missing public detail returns null',await fetchPublishedContent('/api/news/missing')===null)
calls=[]
await fetchPublishedContent('/api/news')
check('Later navigation revalidates published data',calls.length===1 && calls[0].options.cache==='no-cache')
staticStatus=404;calls=[]
check('Missing snapshot falls back to API',(await fetchPublishedContent('/api/news')).length===1 && calls.length===2 && calls[1].url==='/api/index.php?route=news')
staticStatus=200;expiresAt='2026-09-16T11:00:00Z';calls=[]
await fetchPublishedContent('/api/news')
check('Scheduled expiry triggers API refresh',calls.length===2)
// Server Date controls expiry, rather than an inaccurate visitor clock.
expiresAt='2026-09-16T13:00:00Z';calls=[]
await fetchPublishedContent('/api/news')
check('Future expiry uses server time',calls.length===1)
staticStatus=404;apiStatus=503
await assert.rejects(fetchPublishedContent('/api/news'))
apiStatus=200;calls=[]
await fetchPublishedContent('/api/news')
check('Failed API request is retried on next navigation',calls.length===2)
for(const label of passed)console.log('PASS',label)
writeFileSync(resolve('tmp/php-test/public-content-client-results.json'),JSON.stringify(passed,null,2))
console.log(`${passed.length} client checks passed`)
