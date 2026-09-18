"""Create and verify an update archive without private configuration or media."""
from pathlib import Path
import hashlib,json,zipfile,sys,re
root=Path(__file__).resolve().parents[2]
manifest=json.loads((root/'tmp/rapidcloud-build.json').read_text(encoding='utf-8'))
stage=Path(manifest['stage'])
out=root/'tmp/public-content-package';out.mkdir(exist_ok=True)
files=sorted((stage/'api').rglob('*'))+sorted((stage/'assets').rglob('*'))
files=[p for p in files if p.is_file()]
files += [stage/'uploads/web.config',stage/'uploads/content-cache/web.config']
files += sorted(p for p in stage.iterdir() if p.is_file() and p.name!='index.html')
files += [stage/'index.html']
name=sys.argv[1] if len(sys.argv)>1 else '06-fast-public-content.zip'
assert re.fullmatch(r'[0-9]{2}-[a-z0-9-]+\.zip',name),'Invalid archive name'
target=out/name
with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in files:z.write(p,p.relative_to(stage).as_posix())
assert target.stat().st_size<4_000_000,'RapidCloud archive size limit'
with zipfile.ZipFile(target) as z:
    assert z.testzip() is None
    assert len(z.namelist())==len(files)
    for p in files:
        name=p.relative_to(stage).as_posix()
        assert hashlib.sha256(z.read(name)).digest()==hashlib.sha256(p.read_bytes()).digest(),name
    assert not any('idie-private' in name or name.endswith('/config.php') for name in z.namelist())
    assert z.namelist()[-1]=='index.html','New entry page must follow the new assets'
report={'archive':target.name,'bytes':target.stat().st_size,'files':len(files),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'verified':True}
(out/(target.name[:2]+'-archive-verification.json')).write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
