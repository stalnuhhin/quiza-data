<?php
include 'http-utils.php';
include 'file-utils.php';
include 'rating-tour-utils.php';

$FILE = "rating-tour.json";
$CACHE_LIFE = 600; //caching time, in seconds

$json = read_file($FILE, $CACHE_LIFE);
$source_type = $json != null ? "from_file" : "from_site";
if ($json == null) {
    $json = get_rating_tours_data();
    write_file($json, $FILE);
}
array_push($json->debug, $source_type);
response($json);
