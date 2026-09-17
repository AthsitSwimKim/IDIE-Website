<?php
require '/app/httpdocs/api/lib/bootstrap.php';
require '/app/httpdocs/api/lib/png.php';
$passed=0;
function test(string $name, callable $fn): void { global $passed; if (!$fn()) throw new RuntimeException($name); echo "PASS $name\n"; $passed++; }
function reject(string $bytes): bool { try { normalize_uploaded_png($bytes); return false; } catch (ApiError $e) { return $e->status===400; } }
function fixture(int $w=3,int $h=2,int $color=2,?string $raw=null,string $extra=''): string {
    $channels=[0=>1,2=>3,4=>2,6=>4][$color];
    $raw??=str_repeat("\0".str_repeat("\x7f",$w*$channels),$h);
    return "\x89PNG\r\n\x1a\n".png_chunk('IHDR',pack('NNCCCCC',$w,$h,8,$color,0,0,0)).$extra.png_chunk('IDAT',gzcompress($raw)).png_chunk('IEND','');
}
test('Portable processing available without GD',fn()=>portable_png_available() && !extension_loaded('gd'));
foreach ([0,2,4,6] as $color) test('Valid PNG color '.$color,fn()=>normalize_uploaded_png(fixture(color:$color))['width']===3);
test('Metadata removed',fn()=>!str_contains(normalize_uploaded_png(fixture(extra:png_chunk('tEXt','arbitrary metadata')))['bytes'],'metadata'));
test('Pixel stream preserved',function(){ $v=normalize_uploaded_png(fixture()); return $v['bytes']===fixture() && $v['height']===2; });
test('SVG disguised as PNG rejected',fn()=>reject('<svg/>'));
test('PHP disguised as PNG rejected',fn()=>reject('<?php echo 1;'));
test('Header only rejected',fn()=>reject("\x89PNG\r\n\x1a\n"));
test('Trailing payload rejected',fn()=>reject(fixture().'<?php echo 1;'));
test('CRC corruption rejected',function(){ $v=fixture(); $v[30]=chr(ord($v[30])^1); return reject($v); });
test('Truncated chunk rejected',fn()=>reject(substr(fixture(),0,-4)));
test('Invalid pixel length rejected',fn()=>reject(fixture(raw:'bad')));
test('Invalid scanline filter rejected',fn()=>reject(fixture(raw:str_repeat("\x05".str_repeat("\x7f",9),2))));
test('Decompression expansion bounded',fn()=>reject(fixture(1,1,2,str_repeat('X',1000000))));
test('Unknown critical chunk rejected',fn()=>reject(fixture(extra:png_chunk('ABCD','X'))));
test('Animation rejected',fn()=>reject(fixture(extra:png_chunk('acTL',pack('NN',1,0)))));
test('Transparency metadata rejected',fn()=>reject(fixture(extra:png_chunk('tRNS',"\0\0"))));
test('Excessive dimensions rejected',fn()=>reject(fixture(10001,1)));
test('Zero dimensions rejected',fn()=>reject(fixture(0,1)));
test('Duplicate header rejected',fn()=>reject(fixture(extra:png_chunk('IHDR',pack('NNCCCCC',3,2,8,2,0,0,0)))));
echo "$passed portable PNG checks passed\n";
