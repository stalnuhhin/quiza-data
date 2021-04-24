<?php

function substring($text, $start_text, $end_text)
{
    $strpos1 = strpos($text, $start_text);
    if ($strpos1 === false) {
        return "";
    }
    $temp = substr($text, $strpos1 + strlen($start_text));
    $strpos2 = strpos($temp, $end_text);
    if ($strpos2 === false) {
        return "";
    }
    return substr($temp, 0, $strpos2);
}
