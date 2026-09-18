"""Real API lifecycle checks on disposable local uploads and MariaDB only."""
from transport import *
import uuid, concurrent.futures
c=Client(); guest=Client()
check('Owner login',c.call('auth/login','POST',{'username':'owner','password':'New-Owner-Password-2026'})[0]==200)
pair=lambda s:{'th':s,'en':s}
uploads=Path('tmp/php-test/uploads')
created=[]
def image():
    name=uuid.uuid4().hex
    for suffix in ['', '-small']:
        (uploads/(name+suffix+'.png')).write_bytes(b'local disposable image fixture')
    return {'src':'/uploads/'+name+'.png','srcSet':'/uploads/'+name+'-small.png 700w, /uploads/'+name+'.png 1400w','alt':pair('Image'),'width':1400,'height':900}
def files(img):
    return [uploads/Path(img['src']).name,uploads/(Path(img['src']).stem+'-small.png')]
def exists(img): return all(p.exists() for p in files(img))
def absent(img): return all(not p.exists() for p in files(img))
def news(slug,img):
    return dict(slug=slug,title=pair('News'),excerpt=pair('Excerpt'),body=pair('Body'),category='company',publishedAt='2026-01-01T00:00:00.000Z',status='draft',featured=False,cover=img)
def project(slug,img,gallery=[]):
    return dict(slug=slug,name=pair('Project'),client=pair('Client'),location=pair('Rayong'),industry='chemical',year=2026,overview=pair('Overview'),engineeringSolution=pair('Solution'),scopeOfWork=[pair('Scope')],gallery=gallery,cover=img,featured=False,status='draft')
def create(kind,data):
    code,body=c.call('admin/'+kind,'POST',data)
    check('Create '+data.get('slug',kind),code==201)
    key=(kind,body['id']);created.append(key);return key
def delete(key):
    code,_=c.call('admin/%s/%s'%key,'DELETE')
    check('Delete '+str(key),code==200);created.remove(key)
shared=image()
n=create('news',news('cleanup-shared-news',shared))
p=create('projects',project('cleanup-shared-project',shared))
delete(n)
check('Draft project protects shared cover and thumbnail',exists(shared))
delete(p)
check('Last shared reference deletion removes both files',absent(shared))
cover=image(); gallery=image()
p=create('projects',project('cleanup-gallery',cover,[gallery]))
delete(p)
check('Project deletion removes unique cover pair',absent(cover))
check('Project deletion removes unique gallery pair',absent(gallery))
shared=image()
n=create('news',news('cleanup-reference-news',shared))
ref=dict(name=pair('Reference'),customer=pair('Customer'),location=pair('Rayong'),position=0,status='draft',image=shared)
r=create('site-references',ref)
delete(n);check('Draft site reference protects shared images',exists(shared))
delete(r);check('Last site reference cleans shared images',absent(shared))
old=image(); new=image()
data=news('cleanup-replace',old);n=create('news',data)
data['cover']=new
check('Replace saved cover',c.call('admin/%s/%s'%n,'PUT',data)[0]==200)
check('Successful replacement removes old pair and retains new pair',absent(old) and exists(new))
invalid=copy.deepcopy(data);invalid['title']['en']=''
check('Failed edit rejected',c.call('admin/%s/%s'%n,'PUT',invalid)[0]==400)
check('Failed edit keeps current images',exists(new))
check('Guest cannot delete content or files',guest.call('admin/%s/%s'%n,'DELETE')[0]==401 and exists(new))
check('Missing CSRF cannot delete content or files',c.call('admin/%s/%s'%n,'DELETE',csrf=False)[0]==403 and exists(new))
cache=uploads/'content-cache/web.config';backup=Path('tmp/php-test/private/cleanup-cache-config-backup')
cache.rename(backup)
try:
    check('Failed snapshot preflight rejects delete',c.call('admin/%s/%s'%n,'DELETE')[0]==503)
    check('Failed delete preserves database and images',c.call('admin/%s/%s'%n)[0]==200 and exists(new))
finally: backup.rename(cache)
delete(n);check('News deletion removes replaced current pair',absent(new))
old=image();keep=image()
data=project('cleanup-remove-gallery',keep,[old]);p=create('projects',data)
data['gallery']=[]
check('Remove gallery entry',c.call('admin/%s/%s'%p,'PUT',data)[0]==200)
check('Gallery removal cleans old images and keeps cover',absent(old) and exists(keep))
delete(p)
check('Final cover cleaned',absent(keep))
# A thumbnail can be the only surviving explicit reference.
img=image()
n=create('news',news('cleanup-main',img))
small=copy.deepcopy(img);small['src']=img['src'].replace('.png','-small.png');small.pop('srcSet')
p=create('projects',project('cleanup-small',small))
delete(n)
check('Referenced thumbnail retained independently',files(img)[1].exists())
delete(p);check('Thumbnail removed after last use',absent(img))
# Body references are conservatively protected, including scheduled news.
img=image(); n=create('news',news('cleanup-body-cover',img))
data=news('cleanup-body-reference',None);data['body']=pair('Image '+img['src']);data['status']='published';data['publishedAt']='2099-01-01T00:00:00.000Z'
body=create('news',data)
delete(n);check('Scheduled body reference keeps original file',files(img)[0].exists())
delete(body);check('Removing final body reference cleans image group',absent(img))
# Invalid project child validation must roll back while keeping old files.
img=image();data=project('cleanup-rollback',img,[img]);p=create('projects',data)
invalid=copy.deepcopy(data);invalid['gallery']=[None]
check('Invalid gallery update rejected',c.call('admin/%s/%s'%p,'PUT',invalid)[0]==400)
check('Rolled-back gallery retains files and database children',exists(img) and len(c.call('admin/%s/%s'%p)[1]['gallery'])==1)
delete(p)
check('Rolled-back pair later deletes normally',absent(img))
# Two sessions deleting shared rows in different collections must serialize.
img=image();n=create('news',news('cleanup-concurrent-news',img));p=create('projects',project('cleanup-concurrent-project',img))
second=Client()
check('Second independent session login',second.call('auth/login','POST',{'username':'owner','password':'New-Owner-Password-2026'})[0]==200)
clients=[c,second]
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    results=list(pool.map(lambda pair:pair[0].call('admin/%s/%s'%pair[1],'DELETE')[0],zip(clients,[n,p])))
check('Concurrent shared deletions succeed',results==[200,200])
created.remove(n);created.remove(p)
check('Concurrent final deletion removes shared pair',absent(img))
check('All disposable content removed',not created)
Path('tmp/php-test/image-cleanup-results.json').write_text(json.dumps(passed,ensure_ascii=False,indent=2),encoding='utf-8')
print('PASS',len(passed),'image lifecycle checks')

# Optional local-only fixtures for browser layout verification; never packaged.
import sys, shutil
if '--preview' in sys.argv:
    for position in range(2):
        name=uuid.uuid4().hex+'.webp'
        shutil.copyfile('public/images/services/intercommunication-system/cover.webp',uploads/name)
        ref=dict(name=pair('ตัวอย่างโครงการสำหรับทดสอบระยะจัดวางรายการอ้างอิงหน้างาน'),
                 customer=pair('ตัวอย่างลูกค้าสำหรับตรวจหน้าเว็บ'),location=pair('ระยอง'),year=2026,
                 position=position,status='published',image={'src':'/uploads/'+name,'alt':pair('Local layout test')})
        code,_=c.call('admin/site-references','POST',ref)
        assert code==201
    print('Prepared two disposable localhost layout rows')
