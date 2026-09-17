import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { createHash, randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const output=resolve(process.argv[2] || join(root,'tmp','rapidcloud-package'))
const dist=join(root,'tmp','rapidcloud-dist')
function run(file,args,env={}) {
  const r=spawnSync(file,args,{cwd:root,env:{...process.env,...env},stdio:'inherit'})
  if(r.status!==0) throw new Error('Build failed: '+file+' '+args.join(' '))
}
run(process.execPath,['scripts/build-sitemap.mjs'])
run(process.execPath,['node_modules/typescript/bin/tsc','-b'])
run(process.execPath,['node_modules/vite/bin/vite.js','build','--outDir',dist,'--emptyOutDir'],{VITE_API_DRIVER:'php'})
mkdirSync(output,{recursive:true})
const stage=join(root,'tmp','rapidcloud-stage-'+Date.now())
const publicStage=join(stage,'httpdocs')
mkdirSync(publicStage,{recursive:true})
cpSync(join(root,'php-server','httpdocs'),publicStage,{recursive:true})
cpSync(join(dist,'assets'),join(publicStage,'assets'),{recursive:true})
for(const item of readdirSync(dist,{withFileTypes:true})) {
  if(item.isFile()) cpSync(join(dist,item.name),join(publicStage,item.name))
}
const configPath=join(output,'PRIVATE-OUTSIDE-HTTPDOCS','idie-private')
mkdirSync(configPath,{recursive:true})
const keyPath=join(output,'LOCAL-SETUP-KEY.txt')
let token
if(existsSync(keyPath)) {
  token=readFileSync(keyPath,'utf8').match(/Setup token: ([a-f0-9]{64})/)?.[1]
  if(!token) throw new Error('Existing setup key is invalid; do not overwrite it automatically.')
} else {
  token=randomBytes(32).toString('hex')
  writeFileSync(keyPath,'KEEP THIS FILE ON YOUR COMPUTER. NEVER UPLOAD IT.\nSetup token: '+token+'\nUse this token only in /api/setup.php over HTTPS.\n')
}
const privateConfig=join(configPath,'config.php')
if(!existsSync(privateConfig)) {
  const source=readFileSync(join(root,'php-server','idie-private','config.example.php'),'utf8')
    .replace('REPLACE_WITH_RANDOM_APP_KEY_FROM_LOCAL_KEYS_FILE',randomBytes(48).toString('hex'))
    .replace('REPLACE_WITH_SHA256_FROM_LOCAL_KEYS_FILE',createHash('sha256').update(token).digest('hex'))
  writeFileSync(privateConfig,source)
}
writeFileSync(join(configPath,'README.txt'),'Upload idie-private NEXT TO httpdocs: /idindustrial.com/idie-private/config.php\nNever put this folder or this file inside httpdocs.\nFill database and SMTP values in config.php before setup.\n')
cpSync(join(root,'php-server','UPLOAD-GUIDE-TH.md'),join(output,'UPLOAD-GUIDE-TH.md'))
const manifest={builtAt:new Date().toISOString(),driver:'php',output,stage:publicStage}
writeFileSync(join(root,'tmp','rapidcloud-build.json'),JSON.stringify(manifest,null,2))
run('pwsh',['-NoProfile','-File','scripts/package-rapidcloud.ps1','-Source',publicStage,'-Output',output])
console.log('RapidCloud upload package: '+output)