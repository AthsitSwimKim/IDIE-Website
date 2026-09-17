"""Integration tests against isolated PHP + MariaDB, never production."""
import copy, http.cookiejar, json, re, struct, zlib, urllib.request, urllib.error, urllib.parse
from pathlib import Path
BASE='http://127.0.0.1:8099'
passed=[]
def check(label, condition):
    assert condition, label
    passed.append(label)
class Client:
    def __init__(self):
        self.opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        self.csrf=None
    def call(self,route,method='GET',data=None,headers=None,raw=None,csrf=True):
        h=dict(headers or {})
        if method!='GET' and csrf:
            if not self.csrf: self.call('auth/me')
            h['X-CSRF-Token']=self.csrf
        if method in ('PUT','DELETE'):
            h['X-HTTP-Method-Override']=method; method='POST'
        if data is not None:
            raw=json.dumps(data,ensure_ascii=False).encode(); h['Content-Type']='application/json'
        req=urllib.request.Request(BASE+'/api/index.php?route='+urllib.parse.quote(route,safe=''),data=raw,headers=h,method=method)
        try: res=self.opener.open(req)
        except urllib.error.HTTPError as e: res=e
        with res:
            if res.headers.get('X-CSRF-Token'): self.csrf=res.headers['X-CSRF-Token']
            body=res.read()
            try: body=json.loads(body)
            except ValueError: body=body.decode(errors='replace')
            return res.code,body
    def setup(self,token,username='owner',password='Owner-Password-2026'):
        html=self.opener.open(BASE+'/api/setup.php').read().decode()
        csrf=re.search(r'name="csrf" value="([^"]*)"',html).group(1)
        data=urllib.parse.urlencode(dict(csrf=csrf,setupToken=token,username=username,displayName='IDIE Test',password=password,confirmPassword=password)).encode()
        req=urllib.request.Request(BASE+'/api/setup.php',data=data)
        try: res=self.opener.open(req)
        except urllib.error.HTTPError as e: res=e
        return res.code,res.read().decode()
