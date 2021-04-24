<?php

function response($json)
{
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($json);
}
