<?php
include 'utils/http-utils.php';
include 'utils/file-utils.php';

function get_player_tours($playerid)
{
    $data = _get_player_data($playerid);
    $result = new stdClass();
    $result->debug = [];
    $result->tours = [];
    foreach ($data as $key => $value) {
        foreach ($value->tournaments as $tournament) {
            array_push($result->tours, (int)$tournament->idtournament);
        }
    }
    return $result;
}

function _get_player_data($playerid)
{
    $url = "https://rating.chgk.info/api/players/$playerid/tournaments.json";
    return json_decode(file_get_contents($url));
}

$FILE = "players/{id}.json";
$CACHE_LIFE = 21600; //caching time, in seconds, 6 hours

$playerid = (int)htmlspecialchars($_GET["playerid"]);
if ($playerid === 0) {
    response(new stdClass());
    return;
}
$file = str_replace("{id}", $playerid, $FILE);
$json = read_file($file, $CACHE_LIFE);
$source_type = $json != null ? "from_file" : "from_site";
if ($json == null) {
    $json = get_player_tours($playerid);
    write_file($json, $file);
}
array_push($json->debug, $source_type);
response($json);
