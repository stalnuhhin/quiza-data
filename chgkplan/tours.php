<?php
include 'utils/http-utils.php';
include 'utils/file-utils.php';

function get_tours_data()
{
    $startAfter = _get_date("-4 months");
    $endAfter = _get_date("-7 days");
    $endBefore = _get_date("+4 months");
    $page = 1;

    $result = new stdClass();
    $result->debug = [];
    $result->startDateAfter = $startAfter;
    $result->endDateAfter = $endAfter;
    $result->endDateBefore = $endBefore;
    $result->tours = [];
    do {
        $tours = _get_tours($startAfter, $endAfter, $endBefore, $page);
        $has_data = count($tours) > 0;
        if ($has_data) {
            $result->tours = array_merge($result->tours, $tours);
            $page++;
        }
    } while ($has_data);
    array_push($result->debug, "page without data: " . $page);
    return $result;
}

function _get_date($date_modify)
{
    $format = "Y-m-d\TH:i:s";
    $result = new DateTime();
    $result->modify($date_modify);
    return $result->format($format);
}

function _get_tours($startAfter, $endAfter, $endBefore, $page)
{
    $url = "https://api.rating.chgk.net/tournaments?dateStart%5Bafter%5D=$startAfter"
        . "&dateEnd%5Bbefore%5D=$endBefore&dateEnd%5Bafter%5D=$endAfter&page=$page";
    return json_decode(file_get_contents($url));
}

$FILE = "tours.json";
$CACHE_LIFE = 600; //caching time, in seconds, 10 minutes

$json = read_file($FILE, $CACHE_LIFE);
$source_type = $json != null ? "from_file" : "from_site";
if ($json == null) {
    $json = get_tours_data();
    write_file($json, $FILE);
}
array_push($json->debug, $source_type);
response($json);
