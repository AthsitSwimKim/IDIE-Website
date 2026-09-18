"""Nullable year, legacy clients and additive migration on a disposable DB."""
from transport import *
import subprocess
def fixture(action):
    result=subprocess.run(['docker','compose','-p','idie-php-validation','-f','php-server/tests/compose.yaml','exec','-T','php','php','/app/tests/site-reference-year-db.php',action],capture_output=True,text=True,check=True)
    return json.loads(result.stdout)
def snapshot():
    return json.loads(urllib.request.urlopen(BASE+'/uploads/content-cache/site-references.json').read())['items']
c=Client(); guest=Client()
check('Owner login',c.call('auth/login','POST',{'username':'owner','password':'New-Owner-Password-2026'})[0]==200)
column=fixture('column')
check('Fresh schema has nullable unsigned year',column['Null']=='YES' and column['Type'].startswith('smallint') and 'unsigned' in column['Type'])
pair=lambda v:{'th':v,'en':v}
files=[p for p in Path('tmp/php-test/uploads').iterdir() if re.fullmatch(r'[a-f0-9]{32}\.(png|jpg|webp)',p.name)]
if not files:
    # Image lifecycle now removes the core test cover after deletion.
    import uuid
    fixture_image=Path('tmp/php-test/uploads')/(uuid.uuid4().hex+'.png')
    fixture_image.write_bytes(b'disposable year migration image fixture')
    files=[fixture_image]
image={'src':'/uploads/'+files[0].name,'alt':pair('Existing image')}
legacy=dict(name=pair('Existing reference'),customer=pair('Customer'),location=pair('Rayong'),position=7,status='published',image=image)
code,body=c.call('admin/site-references','POST',legacy); rid=body.get('id')
check('Legacy create defaults to no year',code==201 and c.call(f'admin/site-references/{rid}')[1]['year'] is None)
fixture('drop-year')
check('Pre-update database simulated',fixture('column') is None)
before=c.call(f'admin/site-references/{rid}')[1]
check('Admin can read unmigrated records',before['year'] is None and before['image']==image)
check('Public can read unmigrated records',guest.call('site-references')[0]==200 and snapshot()[0]['year'] is None)
check('Public reads do not alter schema',fixture('column') is None)
check('Guest cannot migrate database',guest.call('admin/public-content','POST')[0]==401)
check('Migration requires CSRF',c.call('admin/public-content','POST',csrf=False)[0]==403)
check('Rejected requests leave schema unchanged',fixture('column') is None)
fixture('deny-alter')
try:
    code,body=c.call('admin/public-content','POST')
    check('Missing ALTER privilege gives actionable error',code==503 and 'ALTER' in body['error'])
    check('Failed migration preserves existing records',fixture('column') is None and c.call(f'admin/site-references/{rid}')[1]==before)
finally: fixture('allow-alter')
check('Dashboard update migrates existing database',c.call('admin/public-content','POST')[0]==200 and fixture('column') is not None)
check('Migration preserves text image ID position and status',c.call(f'admin/site-references/{rid}')[1]==before)
check('Migration can run twice without duplicating data',c.call('admin/public-content','POST')[0]==200 and len(c.call('admin/site-references')[1])==1)
ref=dict(legacy,year=2026)
check('Year save works',c.call(f'admin/site-references/{rid}','PUT',ref)[0]==200)
check('Year available in admin API',c.call(f'admin/site-references/{rid}')[1]['year']==2026)
check('Year available in public static data',snapshot()[0]['year']==2026)
old=copy.deepcopy(legacy); old['name']=pair('Edited on old browser')
check('Old browser update preserves year',c.call(f'admin/site-references/{rid}','PUT',old)[0]==200 and c.call(f'admin/site-references/{rid}')[1]['year']==2026)
for invalid in [1899,2201,-1,2026.5,'2026',True,{}]:
    broken=dict(ref,year=invalid)
    code,body=c.call(f'admin/site-references/{rid}','PUT',broken)
    check('Reject invalid year '+repr(invalid),code==400 and 'year' in body['details'])
check('Invalid year never overwrites saved data',c.call(f'admin/site-references/{rid}')[1]['year']==2026)
for year in [1900,2200]:
    check('Valid year boundary '+str(year),c.call(f'admin/site-references/{rid}','PUT',dict(ref,year=year))[0]==200 and snapshot()[0]['year']==year)
ref['year']=None
check('Clear year works',c.call(f'admin/site-references/{rid}','PUT',ref)[0]==200 and c.call(f'admin/site-references/{rid}')[1]['year'] is None and snapshot()[0]['year'] is None)
fixture('drop-year')
ref['year']=2024
check('Save can migrate before first dashboard update',c.call(f'admin/site-references/{rid}','PUT',ref)[0]==200 and fixture('column') is not None and snapshot()[0]['year']==2024)
code,body=c.call('admin/site-references','POST',dict(ref,year=2025)); rid2=body.get('id')
check('Create with year works',code==201 and c.call(f'admin/site-references/{rid2}')[1]['year']==2025)
check('Static exports keep published public shape',all('status' not in v and 'position' not in v for v in snapshot()))
for id in [rid,rid2]:check('Delete test reference '+str(id),c.call(f'admin/site-references/{id}','DELETE')[0]==200)
check('Deletion updates public file',snapshot()==[])
for label in passed: print('PASS',label)
print(f'{len(passed)} year and migration checks passed')
Path('tmp/php-test/site-reference-year-results.json').write_text(json.dumps(passed,indent=2),encoding='utf-8')
