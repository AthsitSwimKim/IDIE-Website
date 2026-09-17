from transport import *
from io import BytesIO
from PIL import Image

def upload(client,content):
    boundary='portable-upload-test'
    raw=(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="photo.png"\r\nContent-Type: image/png\r\n\r\n'.encode()+content+f'\r\n--{boundary}--\r\n'.encode())
    return client.call('admin/uploads','POST',raw=raw,headers={'Content-Type':'multipart/form-data; boundary='+boundary})

c=Client(); guest=Client()
check('Portable runtime installer reports image processing ready','ระบบจัดการรูป</span><strong>พร้อม' in c.opener.open(BASE+'/api/setup.php').read().decode())
check('Portable login works',c.call('auth/login','POST',{'username':'owner','password':'New-Owner-Password-2026'})[0]==200)
output=BytesIO(); Image.new('RGBA',(1400,700),(20,80,180,100)).save(output,format='PNG'); png=output.getvalue()
check('Portable upload requires auth',upload(guest,png)[0]==401)
check('Portable upload requires csrf',c.call('admin/uploads','POST',raw=b'',headers={'Content-Type':'multipart/form-data; boundary=x'},csrf=False)[0]==403)
check('Portable fake image rejected',upload(c,b'<svg/>')[0]==400)
check('Portable trailing PHP rejected',upload(c,png+b'<?php echo 1;')[0]==400)
check('Portable oversized file rejected',upload(c,b'x'*3000001)[0]==413)
status,image=upload(c,png)
check('Portable PNG saved with dimensions',status==201 and image['width']==1400 and image['height']==700 and image['src'].endswith('.png'))
saved=guest.opener.open(BASE+image['src']).read(); decoded=Image.open(BytesIO(saved)); decoded.load()
check('Portable saved image actually decodes with matching pixels',decoded.size==(1400,700) and decoded.convert('RGBA').getpixel((100,100))==(20,80,180,100))
pair=lambda s:{'th':s,'en':s}
payload=dict(slug='portable-upload-news',title=pair('PNG upload'),excerpt=pair('Portable image'),body=pair('Portable test'),category='company',publishedAt='2026-01-01T00:00:00.000Z',status='published',featured=False,cover=dict(image,alt=pair('PNG image')))
status,result=c.call('admin/news','POST',payload)
check('Portable image stored in published news',status==201 and guest.call('news/portable-upload-news')[1]['cover']['src']==image['src'])

print(f'{len(passed)} portable upload checks passed')
