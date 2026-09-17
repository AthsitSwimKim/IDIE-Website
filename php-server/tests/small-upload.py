from transport import *
c=Client()
assert c.call('auth/login','POST',{'username':'owner','password':'New-Owner-Password-2026'})[0]==200
def chunk(t,v): return struct.pack('!I',len(v))+t+v+struct.pack('!I',zlib.crc32(t+v)&0xffffffff)
w,h=300,150
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress((b'\0'+b'\x00\x40\xff'*w)*h))+chunk(b'IEND',b'')
boundary='smallImageBoundary'
raw=(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="small.png"\r\nContent-Type: image/png\r\n\r\n'.encode()+png+f'\r\n--{boundary}--\r\n'.encode())
code,img=c.call('admin/uploads','POST',raw=raw,headers={'Content-Type':'multipart/form-data; boundary='+boundary})
assert code==201 and img['width']==300 and img['height']==150
assert 'srcSet' not in img
print('PASS Small images keep original dimensions and avoid duplicate srcSet widths')