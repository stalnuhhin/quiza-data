<?php
include 'utils/http-utils.php';
include 'utils/file-utils.php';
include 'utils/rating-tour-utils.php';

$FILE = "tours-extra.json";
$CACHE_LIFE = 600; //caching time, in seconds, 10 minutes

$json = read_file($FILE, $CACHE_LIFE);
$source_type = $json != null ? "from_file" : "from_site";
if ($json == null) {
    $json = get_rating_tours_data();
    write_file($json, $FILE);
}
array_push($json->debug, $source_type);
response($json);
