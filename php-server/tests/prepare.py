"""Prepare only disposable local validation files. No production credentials."""
from pathlib import Path
import datetime, hashlib, shutil
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa
root=Path(__file__).resolve().parents[2]
private=root/'tmp/php-test/private'; uploads=root/'tmp/php-test/uploads'
private.mkdir(parents=True,exist_ok=True); uploads.mkdir(parents=True,exist_ok=True)
config=(root/'php-server/idie-private/config.example.php').read_text(encoding='utf-8')
config=config.replace('https://www.idindustrial.com','http://127.0.0.1:8099').replace("'require_https' => true","'require_https' => false")
config=config.replace('REPLACE_WITH_RANDOM_APP_KEY_FROM_LOCAL_KEYS_FILE','local-test-app-key-'+'x'*40)
config=config.replace('REPLACE_WITH_SHA256_FROM_LOCAL_KEYS_FILE',hashlib.sha256(b'local-test-setup-key').hexdigest())
config=config.replace('REPLACE_WITH_MARIADB_SERVER_FROM_SOLIDCP','db').replace('REPLACE_WITH_DATABASE_NAME','idie_php_test').replace('REPLACE_WITH_DATABASE_USER','idie_test')
config=config.replace("'password' => '',","'password' => 'local-test-password',",1)
(private/'config.php').write_text(config,encoding='utf-8')
shutil.copyfile(root/'php-server/httpdocs/uploads/web.config',uploads/'web.config')
shutil.copytree(root/'php-server/httpdocs/uploads/content-cache',uploads/'content-cache',dirs_exist_ok=True)
key=rsa.generate_private_key(public_exponent=65537,key_size=2048)
name=x509.Name([x509.NameAttribute(NameOID.COMMON_NAME,'mailpit')])
now=datetime.datetime.now(datetime.timezone.utc)
cert=(x509.CertificateBuilder().subject_name(name).issuer_name(name).public_key(key.public_key()).serial_number(x509.random_serial_number())
    .not_valid_before(now-datetime.timedelta(minutes=5)).not_valid_after(now+datetime.timedelta(days=7))
    .add_extension(x509.SubjectAlternativeName([x509.DNSName('mailpit')]),critical=False)
    .add_extension(x509.BasicConstraints(ca=True,path_length=0),critical=True).sign(key,hashes.SHA256()))
(private/'mailpit-cert.pem').write_bytes(cert.public_bytes(serialization.Encoding.PEM))
(private/'mailpit-key.pem').write_bytes(key.private_bytes(serialization.Encoding.PEM,serialization.PrivateFormat.PKCS8,serialization.NoEncryption()))
print('Prepared disposable local PHP validation configuration and TLS certificate')
shutil.copytree(root/'php-server/httpdocs',root/'tmp/rapidcloud-dist',dirs_exist_ok=True)
