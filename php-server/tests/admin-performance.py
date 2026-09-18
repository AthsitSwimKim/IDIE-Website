
"""Summary correctness and actual same-session parallel GET behavior on disposable localhost."""
from transport import *
import concurrent.futures,subprocess,time
c=Client();guest=Client()
check('Dashboard requires authentication',guest.call('admin/dashboard')[0]==401)
check('Owner login',c.call('auth/login','POST',{'username':'owner','password':'New-Owner-Password-2026'})[0]==200)
code,initial=c.call('admin/dashboard')
check('Empty dashboard counts are accurate',code==200 and all(v=={'published':0,'draft':0} for v in initial['stats'].values()) and initial['drafts']==[] and initial['recentNews']==[])
pair=lambda s:{'th':s,'en':s}
fixtures=[]
news=dict(slug='performance-news-0',title=pair('Local summary headline 0'),excerpt=pair('Test excerpt'),body=pair('PRIVATE LARGE BODY '*1500),category='company',publishedAt='2026-01-01T00:00:00.000Z',status='published',featured=False,cover=None)
for i in range(7):
    item=dict(news,slug='performance-news-'+str(i),title=pair('Local summary headline '+str(i)),publishedAt='2026-01-'+str(i+1).zfill(2)+'T00:00:00.000Z',status='draft' if i==6 else 'published')
    code,body=c.call('admin/news','POST',item);fixtures.append(('news',body.get('id')))
    check('Create summary fixture '+str(i),code==201 and body.get('id'))
project=dict(slug='performance-project',name=pair('Local project draft'),client=pair('Local customer'),location=pair('Rayong'),industry='chemical',year=2026,overview=pair('PRIVATE PROJECT OVERVIEW'),engineeringSolution=pair('PRIVATE SOLUTION'),scopeOfWork=[pair('PRIVATE SCOPE')],gallery=[],cover=None,featured=False,status='draft')
code,body=c.call('admin/projects','POST',project);pid=body.get('id');fixtures.append(('projects',pid))
check('Project draft created',code==201 and pid)
ref=dict(name=pair('Local reference draft'),customer=pair('Local customer'),location=pair('Rayong'),year=2026,position=0,status='draft',image=None)
code,body=c.call('admin/site-references','POST',ref);rid=body.get('id');fixtures.append(('site-references',rid))
check('Reference draft created',code==201 and rid)
code,data=c.call('admin/dashboard')
check('All summary counts match status',code==200 and data['stats']=={'news':{'published':6,'draft':1},'projects':{'published':0,'draft':1},'site-references':{'published':0,'draft':1}})
check('Draft navigation labels preserved',len(data['drafts'])==3 and {v['title'] for v in data['drafts']}=={'Local summary headline 6','Local project draft','Local reference draft'} and all(v['to'].startswith('/admin/') for v in data['drafts']))
check('Only five most recent headlines returned',len(data['recentNews'])==5 and [v['title'] for v in data['recentNews']]==['Local summary headline '+str(i) for i in range(6,1,-1)])
encoded=json.dumps(data)
check('Dashboard excludes large bodies, cover and project children',not any(v in encoded for v in ['PRIVATE LARGE BODY','PRIVATE PROJECT OVERVIEW','PRIVATE SOLUTION','PRIVATE SCOPE','scopeOfWork','cover','password']))
check('Dashboard response is compact',len(encoded.encode())<4000)
check('Visitor total preserved',data['visitors']==guest.call('visitors')[1]['total'])
check('Mutation still requires CSRF after released GET',c.call('admin/public-content','POST',csrf=False)[0]==403)
check('CSRF header from released GET still works',c.call('admin/public-content','POST')[0]==200)
def clone():
    client=Client()
    source=next(h.cookiejar for h in c.opener.handlers if hasattr(h,'cookiejar'))
    dest=next(h.cookiejar for h in client.opener.handlers if hasattr(h,'cookiejar'))
    for cookie in source:dest.set_cookie(copy.copy(cookie))
    client.csrf=c.csrf
    return client
marker=Path('tmp/php-test/private/performance-db-locked')
if marker.exists():marker.unlink()
probe=subprocess.Popen(['docker','compose','-p','idie-php-validation','-f','php-server/tests/compose.yaml','exec','-T','php','php','/app/tests/admin-performance-db.php'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
try:
    deadline=time.monotonic()+6
    while not marker.exists() and probe.poll() is None and time.monotonic()<deadline:time.sleep(.05)
    check('Disposable database lock probe ready',marker.exists())
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        start=time.monotonic()
        slow=pool.submit(clone().call,'admin/dashboard')
        time.sleep(.25)
        auth_start=time.monotonic();auth_code,auth_body=clone().call('auth/me');auth_elapsed=time.monotonic()-auth_start
        slow_code,slow_body=slow.result(timeout=8);dashboard_elapsed=time.monotonic()-start
    check('Slow dashboard still returns accurate data',slow_code==200 and slow_body==data and dashboard_elapsed>1.5)
    check('Same-session auth GET is not blocked by slow dashboard',auth_code==200 and auth_body['user']['username']=='owner' and auth_elapsed<1.5)
    print('PARALLEL GET: auth %.3fs while dashboard %.3fs'%(auth_elapsed,dashboard_elapsed))
finally:
    stdout,stderr=probe.communicate(timeout=8)
    if probe.returncode:raise RuntimeError(stderr.decode())
for kind,id in fixtures:check('Remove local fixture '+kind+' '+str(id),c.call('admin/'+kind+'/'+str(id),'DELETE')[0]==200)
check('Summary refresh reflects deleted content',all(v=={'published':0,'draft':0} for v in c.call('admin/dashboard')[1]['stats'].values()))
for label in passed:print('PASS',label)
print(str(len(passed))+' admin performance checks passed')
Path('tmp/php-test/admin-performance-results.json').write_text(json.dumps({'checks':passed,'authSecondsWhileDashboardBlocked':auth_elapsed,'dashboardBlockedSeconds':dashboard_elapsed},indent=2),encoding='utf-8')
