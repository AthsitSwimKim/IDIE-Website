"""Exercise actual PHPMailer SMTP/TLS locally with Mailpit; no external mail."""
import importlib.util,json,urllib.request
from pathlib import Path
spec=importlib.util.spec_from_file_location('transport',Path(__file__).with_name('transport.py'))
transport=importlib.util.module_from_spec(spec);spec.loader.exec_module(transport)
c=transport.Client()
config=Path('tmp/php-test/private/config.php'); original=config.read_text(encoding='utf-8')
checks=[]
def check(label,condition):
    assert condition,label
    checks.append(label)
def configure(host,port):
    source=original.replace("'host' => '', 'port' => 587",f"'host' => '{host}', 'port' => {port}")
    source=source.replace("'user' => '', 'password' => ''","'user' => 'smtp-test', 'password' => 'local-smtp-test'")
    source=source.replace("'from' => ''","'from' => 'website@example.com'").replace("'to' => ''","'to' => 'company@example.com'")
    config.write_text(source,encoding='utf-8')
payload=dict(name='SMTP Integration',company='Test company',email='visitor@example.com',phone='000',subject='TLS contact integration',message='ข้อความทดสอบผ่าน TLS\nNo external mail.',locale='th')
try:
    configure('127.0.0.1',1)
    code,body=c.call('contact','POST',payload)
    check('Failed SMTP returns error, never success',code==502 and 'SMTP' not in body.get('error','') and 'password' not in str(body))
    configure('mailpit',1025)
    code,body=c.call('contact','POST',payload)
    check('Actual authenticated SMTP STARTTLS delivery succeeds',code==200 and body=={'ok':True})
    messages=json.load(urllib.request.urlopen('http://127.0.0.1:8100/api/v1/messages'))
    msg=next(m for m in messages['messages'] if 'TLS contact integration' in m['Subject'])
    detail=json.load(urllib.request.urlopen('http://127.0.0.1:8100/api/v1/message/'+msg['ID']))
    check('Recipient is configured company address',detail['To'][0]['Address']=='company@example.com')
    check('Reply-To is inquiry sender',detail['ReplyTo'][0]['Address']=='visitor@example.com')
    check('Sender is authorized website address',detail['From']['Address']=='website@example.com')
    check('Thai body preserved in delivered message',payload['message'] in detail['Text'].replace('\r\n','\n'))
    # Initial core suite consumed one contact request. Two above bring it to three.
    codes=[c.call('contact','POST',payload)[0] for _ in range(4)]
    check('Contact rate limit returns 429',429 in codes)
finally:
    config.write_text(original,encoding='utf-8')
for label in checks: print('PASS',label)
Path('tmp/php-test/smtp-results.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(checks)} SMTP checks passed')