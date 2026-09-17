<?php
$files=new RecursiveIteratorIterator(new RecursiveDirectoryIterator('/app/httpdocs/api',FilesystemIterator::SKIP_DOTS));
$failed=0; $count=0;
foreach($files as $file) if($file->getExtension()==='php') {
    passthru('php -l '.escapeshellarg($file->getPathname()),$status);
    $failed+=$status!==0?1:0; $count++;
}
echo $count." PHP files checked\n"; exit($failed?1:0);