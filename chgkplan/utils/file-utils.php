<?php

function read_file($file, $cache_life)
{
    if (file_exists($file)) {
        $filemtime = @filemtime($file);
        if (time() - $filemtime < $cache_life) {
            $json = file_get_contents($file);
            return json_decode($json);
        }
    }
    return null;
}

function write_file($json, $file)
{
    $fp = fopen($file, 'w');
    fwrite($fp, json_encode($json));
    fclose($fp);
}
