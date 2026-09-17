"""Published snapshot behavior on the disposable local integration database."""
from transport import *
import concurrent.futures
c=Client(); guest=Client()
check('Guest cannot rebuild public files',guest.call('admin/public-content','POST')[0]==401)
check('Owner login',c.call('auth/login','POST',{'username':'owner','password':'New-Owner-Password-2026'})[0]==200)
check('Initial snapshots generated',c.call('admin/public-content','POST')==(200,{'ok':True,'counts':{'news':0,'projects':0,'site-references':0}}))
def snapshot(kind):
    with urllib.request.urlopen(BASE+'/uploads/content-cache/'+kind+'.json') as res:
        return json.loads(res.read())
for kind in ['news','projects','site-references']:
    s=snapshot(kind)
    check(kind+' static public shape',s['version']==1 and s['kind']==kind and s['items']==[])
pair=lambda s:{'th':s,'en':s}
news=dict(slug='snapshot-news',title=pair('PRIVATE DRAFT'),excerpt=pair('Excerpt'),body=pair('PRIVATE BODY'),category='company',publishedAt='2026-01-01T00:00:00.000Z',status='draft',featured=False,cover=None)
code,body=c.call('admin/news','POST',news); nid=body.get('id')
check('Draft save works',code==201 and nid)
check('Draft text never exported',snapshot('news')['items']==[] and 'PRIVATE' not in json.dumps(snapshot('news')))
news['status']='published'; news['publishedAt']='2099-01-01T00:00:00.000Z'
check('Scheduled save works',c.call(f'admin/news/{nid}','PUT',news)[0]==200)
s=snapshot('news')
check('Scheduled body hidden and expiry set',s['items']==[] and s['expiresAt']=='2099-01-01T00:00:00+00:00' and 'PRIVATE' not in json.dumps(s))
news['title']=pair('Published'); news['body']=pair('Public body'); news['publishedAt']='2026-01-01T00:00:00.000Z'
check('Published save works',c.call(f'admin/news/{nid}','PUT',news)[0]==200)
s=snapshot('news')
check('Published snapshot has public fields only',s['items'][0]['title']==news['title'] and 'status' not in s['items'][0] and 'id' not in s['items'][0] and s['expiresAt'] is None)
news['title']=pair('Updated')
check('Edit immediately updates snapshot',c.call(f'admin/news/{nid}','PUT',news)[0]==200 and snapshot('news')['items'][0]['title']==news['title'])
cache_dir=Path('tmp/php-test/uploads/content-cache')
config=cache_dir/'web.config'; backup=Path('tmp/php-test/private/cache-config-test-backup')
config.rename(backup)
try:
    broken=copy.deepcopy(news); broken['title']=pair('Must not save')
    code,body=c.call(f'admin/news/{nid}','PUT',broken)
    check('Missing protected directory returns actionable error',code==503 and 'content-cache' in body['error'])
    check('Failed snapshot preflight preserves database and public file',c.call(f'admin/news/{nid}')[1]['title']==news['title'] and snapshot('news')['items'][0]['title']==news['title'])
finally:
    backup.rename(config)
news['status']='draft'
check('Unpublish removes public item',c.call(f'admin/news/{nid}','PUT',news)[0]==200 and snapshot('news')['items']==[])
project=dict(slug='snapshot-project-a',name=pair('Project A'),client=pair('Customer'),location=pair('Rayong'),industry='chemical',year=2026,overview=pair('Overview'),engineeringSolution=pair('Solution'),scopeOfWork=[pair('First A'),pair('Second A')],gallery=[],cover=None,featured=False,status='published')
code,body=c.call('admin/projects','POST',project); pid=body.get('id')
check('First project save',code==201 and pid)
other=copy.deepcopy(project); other['slug']='snapshot-project-b'; other['scopeOfWork']=[pair('Only B')]
code,body=c.call('admin/projects','POST',other); pid2=body.get('id')
check('Second project save',code==201 and pid2)
items=snapshot('projects')['items']; by_slug={v['slug']:v for v in items}
check('Batch child mapping preserves project and order',by_slug[project['slug']]['scopeOfWork']==project['scopeOfWork'] and by_slug[other['slug']]['scopeOfWork']==other['scopeOfWork'])
check('Static project shape matches API',guest.call('projects')[1]==items)
ref=dict(name=pair('Reference'),customer=pair('Customer'),location=pair('Rayong'),position=3,status='published',image=None)
code,body=c.call('admin/site-references','POST',ref); rid=body.get('id')
check('Reference static export',code==201 and snapshot('site-references')['items'][0]['id']==rid and 'status' not in snapshot('site-references')['items'][0])
ref['name']=pair('Edited reference')
check('Reference edit refreshes static file',c.call(f'admin/site-references/{rid}','PUT',ref)[0]==200 and snapshot('site-references')['items'][0]['name']==ref['name'])
# Multiple requests rebuilding the same collection must leave one valid complete file.
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results=list(pool.map(lambda _:Client().call('projects'),range(8)))
check('Concurrent refresh keeps valid snapshot',all(code==200 and data==items for code,data in results) and snapshot('projects')['items']==items)
pending=cache_dir/'pending-private-test'
pending.write_text('PRIVATE DRAFT',encoding='utf-8')
try:
    for name in ['web.config','pending-private-test']:
        try: urllib.request.urlopen(BASE+'/uploads/content-cache/'+name); code=200
        except urllib.error.HTTPError as e: code=e.code
        check('Protected cache file denied: '+name,code in [403,404])
finally: pending.unlink()
for kind,ids in [('news',[nid]),('projects',[pid,pid2]),('site-references',[rid])]:
    for id in ids: check(kind+' delete '+str(id),c.call(f'admin/{kind}/{id}','DELETE')[0]==200)
    check(kind+' deletion refreshes snapshot',snapshot(kind)['items']==[])
check('No abandoned pending files',not list(cache_dir.glob('pending-*')))
for label in passed: print('PASS',label)
print(f'{len(passed)} snapshot checks passed')
Path('tmp/php-test/public-content-results.json').write_text(json.dumps(passed,indent=2),encoding='utf-8')
