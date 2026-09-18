
"""Career migration, publication privacy and CRUD on the disposable local database."""
from transport import *
import concurrent.futures
c=Client();guest=Client()
check('Owner login',c.call('auth/login','POST',{'username':'owner','password':'New-Owner-Password-2026'})[0]==200)
def snapshot():
    return json.loads(urllib.request.urlopen(BASE+'/uploads/content-cache/jobs.json').read())['items']
seed=json.loads(Path('php-server/httpdocs/api/lib/jobs.seed.json').read_text(encoding='utf-8'))
check('Initial postings exactly preserve existing public data',guest.call('jobs')==(200,seed) and snapshot()==seed)
check('Guest cannot manage jobs',guest.call('admin/jobs')[0]==401)
check('Seed marker survives repeated initialization',c.call('admin/public-content','POST')[0]==200 and len(c.call('admin/jobs')[1])==2)
code,jobs=c.call('admin/jobs')
check('Admin can read both seeded jobs',code==200 and len(jobs)==2 and all(j['status']=='published' and j['isOpen'] for j in jobs))
ids=[j['id'] for j in jobs]
first=copy.deepcopy(jobs[0]); first['title']={'th':'แก้ชื่อเดิม', 'en':'Edited existing title'}
check('Existing posting editable',c.call('admin/jobs/'+str(first['id']),'PUT',first)[0]==200 and snapshot()[0]['title']==first['title'])
check('Refresh does not overwrite existing edits',c.call('admin/public-content','POST')[0]==200 and c.call('admin/jobs/'+str(first['id']))[1]['title']==first['title'])
pair=lambda s:{'th':s,'en':s}
job=dict(slug='careers-test',title=pair('PRIVATE DRAFT JOB'),department=pair('Engineering'),location=pair('Rayong'),employmentType='part-time',positions=2,position=0,status='draft',isOpen=True,postedAt='2026-09-18',responsibilities=[pair('First task'),pair('Second task')],qualifications=[pair('First qualification')])
check('Mutation requires CSRF',c.call('admin/jobs','POST',job,csrf=False)[0]==403)
code,body=c.call('admin/jobs','POST',job);jid=body.get('id')
check('Create draft job',code==201 and jid)
check('Draft content hidden from API, slug and static snapshot',all(v['slug']!=job['slug'] for v in guest.call('jobs')[1]) and guest.call('jobs/'+job['slug'])[0]==404 and 'PRIVATE DRAFT JOB' not in json.dumps(snapshot()))
check('Ordered bilingual fields and metadata preserved',all(c.call('admin/jobs/'+str(jid))[1][k]==v for k,v in job.items()))
check('Duplicate slug rejected',c.call('admin/jobs','POST',job)[0]==409)
job['status']='published';job['title']=pair('Open test position')
check('Publish job immediately updates public snapshot',c.call('admin/jobs/'+str(jid),'PUT',job)[0]==200 and any(v['slug']==job['slug'] for v in snapshot()))
public=guest.call('jobs/'+job['slug'])[1]
check('Public job shape excludes admin metadata and cover',set(public)==set(seed[0]) and 'id' not in public and 'status' not in public and 'position' not in public and 'cover' not in public)
check('Employment type and ordered lists reach public',public['employmentType']=='part-time' and public['responsibilities']==job['responsibilities'] and public['qualifications']==job['qualifications'])
for key,value in [('isOpen','yes'),('isOpen',1),('employmentType','unknown'),('positions',-1),('position',10000),('positions',True),('postedAt','2026-02-30'),('postedAt','2026-9-18'),('responsibilities',[]),('qualifications',[{'th':'only Thai'}]),('qualifications',[pair('a')]*31),('slug','bad/slug')]:
    broken=dict(job);broken[key]=value
    check('Reject invalid '+key+' '+str(value)[:35],c.call('admin/jobs/'+str(jid),'PUT',broken)[0]==400)
check('Invalid updates leave database and snapshot unchanged',c.call('admin/jobs/'+str(jid))[1]['title']==job['title'] and guest.call('jobs/'+job['slug'])[1]==public)
config=Path('tmp/php-test/uploads/content-cache/web.config');backup=Path('tmp/php-test/private/careers-config-backup')
config.rename(backup)
try:
    broken=dict(job,title=pair('Must not save'))
    check('Failed cache preflight returns actionable error',c.call('admin/jobs/'+str(jid),'PUT',broken)[0]==503)
    check('Failed cache preflight preserves database',c.call('admin/jobs/'+str(jid))[1]['title']==job['title'])
finally:backup.rename(config)
job['isOpen']=False;job['title']=pair('PRIVATE CLOSED JOB')
check('Close job',c.call('admin/jobs/'+str(jid),'PUT',job)[0]==200)
check('Closed published job hidden from list/detail/static',guest.call('jobs/'+job['slug'])[0]==404 and all(v['slug']!=job['slug'] for v in guest.call('jobs')[1]) and 'PRIVATE CLOSED JOB' not in json.dumps(snapshot()))
check('Closed job remains editable in admin',c.call('admin/jobs/'+str(jid))[1]['title']==job['title'] and not c.call('admin/jobs/'+str(jid))[1]['isOpen'])
job['isOpen']=True
check('Reopen job restores public card',c.call('admin/jobs/'+str(jid),'PUT',job)[0]==200 and guest.call('jobs/'+job['slug'])[0]==200)
job['status']='draft'
check('Unpublish removes public job',c.call('admin/jobs/'+str(jid),'PUT',job)[0]==200 and guest.call('jobs/'+job['slug'])[0]==404)
for j in jobs:
    closed=dict(j,isOpen=False)
    check('Close existing posting '+str(j['id']),c.call('admin/jobs/'+str(j['id']),'PUT',closed)[0]==200)
check('All positions closed gives true empty public list',guest.call('jobs')==(200,[]) and snapshot()==[])
check('Empty result survives rebuild',c.call('admin/public-content','POST')[1]['counts']['jobs']==0 and snapshot()==[])
for id in ids+[jid]:check('Delete fixture '+str(id),c.call('admin/jobs/'+str(id),'DELETE')[0]==200)
check('Deleted jobs absent from admin and static public data',c.call('admin/jobs')==(200,[]) and snapshot()==[])
def rebuild(_):
    client=Client()
    source=next(h.cookiejar for h in c.opener.handlers if hasattr(h,'cookiejar'))
    dest=next(h.cookiejar for h in client.opener.handlers if hasattr(h,'cookiejar'))
    for cookie in source: dest.set_cookie(copy.copy(cookie))
    client.csrf=c.csrf
    return client.call('admin/public-content','POST')
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    results=list(pool.map(rebuild,range(3)))
check('Concurrent rebuild succeeds without reseeding',all(code==200 and result['counts']['jobs']==0 for code,result in results) and c.call('admin/jobs')==(200,[]) and snapshot()==[])
# Restore only disposable fixtures for the browser check through public CRUD.
for i,item in enumerate(seed):
    code,_=c.call('admin/jobs','POST',dict(item,status='published',position=i))
    check('Restore local seed fixture '+str(i),code==201)
check('Direct static jobs matches API',snapshot()==guest.call('jobs')[1])
try: urllib.request.urlopen(BASE+'/api/lib/jobs.seed.json'); code=200
except urllib.error.HTTPError as e: code=e.code
check('Initial import seed file cannot be downloaded',code==404)
for label in passed:print('PASS',label)
print(str(len(passed))+' careers checks passed')
Path('tmp/php-test/careers-results.json').write_text(json.dumps(passed,ensure_ascii=False,indent=2),encoding='utf-8')
