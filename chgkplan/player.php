<?php
$playerid = (int)htmlspecialchars($_GET["playerid"]);
$url = "https://rating.chgk.info/api/players/$playerid/tournaments.json";
$json = file_get_contents($url);
$json = json_decode($json);
$result = [];
foreach ($json as $key => $value) {
    foreach ($value->tournaments as $tournament) {
        array_push($result, (int)$tournament->idtournament);
    }
}
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
echo json_encode($result);
