<?php
include 'string-utils.php';

function get_rating_tours_data()
{
    return _convert_rows(_request_html_rows());
}

function _request_html_rows()
{
    $url = "https://rating.chgk.info/tournaments";
    $html = file_get_contents($url);
    $html = substring($html, "<tbody>", "</tbody>");
    $rows = explode("<tr", $html);
    array_shift($rows); // 1st element contains <tbody> and must be removed
    return $rows;
}

function _convert_rows($rows)
{
    $result = new stdClass();
    $result->debug = [];
    $count = 0;
    foreach ($rows as $row) {
        $item = _convert_row($row);
        if ($item == null) {
            continue;
        }
        $key = "id" . $item->id;
        $result->$key = $item;
        if (((int)$item->id) > 0) {
            $count++;
        } else {
            array_push($result->debug, "problem row: " . $row);
        }
    }
    array_push($result->debug, "items count: " . $count);
    return $result;
}

function _convert_row($row)
{
    $dummy_content = "<hr style=\"color: black; border: 1px solid black;\"/>";
    if (strpos($row, $dummy_content) > -1) {
        return null;
    }

    $id = _get_id($row);
    $dl = _get_dl($row);
    $editors = _get_editors($row);

    $item = new stdClass();
    $item->id = $id;
    if (((float)$dl) > 0) {
        $item->dl = $dl;
    }
    if ($editors != null) {
        $item->editors = $editors;
    }
    return $item;
}

function _get_id($row)
{
    return substring($row, "<a href=\"/tournament/", "\">");
}

function _get_dl($row)
{
    $temp = substring($row, "<span class=\"var-dl\">", "</span>");
    $temp = substring($temp, "{", "}");
    return str_replace(",", ".", $temp);
}

function _get_editors($row)
{
    $temp = substring($row, "Редакторы турнира:<br />", "</span>");
    $items = explode("<br />", $temp);
    $items = array_map('trim', $items);
    array_pop($items);
    return $items;
}
