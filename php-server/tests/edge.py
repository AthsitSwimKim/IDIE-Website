"""Additional validations for edge cases and error privacy."""
from transport import *
c=Client()
checks=[]
def check(label,condition):
    assert condition,label
    checks.append(label)
check('Authenticated login for edge-case checks',c.call('auth/login','POST',{'username':'owner','password':'New-Owner-Password-2026'})[0]==200)
check('NUL byte in bcrypt password rejected as validation error',c.call('admin/users','POST',{'username':'nul-test','displayName':'Test','password':'long-password\0value'})[0]==400)
check('Oversized bcrypt password rejected',c.call('admin/users','POST',{'username':'long-test','displayName':'Test','password':'x'*73})[0]==400)
check('Invalid JSON rejected',c.call('admin/news','POST',raw=b'{bad',headers={'Content-Type':'application/json'})[0]==400)
check('JSON array body rejected',c.call('admin/news','POST',raw=b'[]',headers={'Content-Type':'application/json'})[0]==400)
check('Bad content type rejected',c.call('admin/news','POST',raw=b'{}',headers={'Content-Type':'text/plain'})[0]==415)
for path in ['/api/lib/bootstrap.php','/api/lib/schema.sql','/uploads/web.config','/uploads/test.php']:
    try: res=c.opener.open(BASE+path)
    except urllib.error.HTTPError as e: res=e
    check('Private or executable path blocked: '+path,res.code==404)
for label in checks: print('PASS',label)
Path('tmp/php-test/edge-results.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(checks)} edge checks passed')