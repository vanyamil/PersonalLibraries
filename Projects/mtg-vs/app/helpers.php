<?php

function get_image_link($id) {
	$one = $id[0];
	$two = $id[1];
	return "https://img.scryfall.com/cards/normal/front/${one}/${two}/${id}.jpg";
}

function max_matchups() {
	$OFFSET = 3;
	$min_matchups = app('db')->table('cards')->min('matchups');
	return $min_matchups + $OFFSET;
}

function name_from_id($id) {
	return app('db')->table('cards')->find($id, 'name');
}

function method_field($method) {
	return "<input type='hidden' name='_method' value='$method' />";
}