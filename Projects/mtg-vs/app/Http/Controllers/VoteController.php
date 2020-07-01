<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class VoteController extends Controller
{
	public function generate() {
		// How many more matchups than the min can the cards have?

		// Get two random cards such that they haven't been seen too much
		// Theoretically possible that only 1 card is found, but highly unlikely
		[$card1, $card2] = app('db')->table('cards')
									->where('matchups', '<', max_matchups())
									->inRandomOrder()
									->take(2)
									->get();

		// Obtain image URLs
		$card1->link = get_image_link($card1->scryfall_id);
		$card2->link = get_image_link($card2->scryfall_id);

		return [$card1, $card2];
	}

	public function save_vote(Request $request) {
		$input = $request->all(); 
		// winner, loser, ordered - rest is auto-populated

		// Extra check for matchups
		$max_matchups = max_matchups();
		$winner_matchups = app('db')->table('cards')
				 					->where('scryfall_id', $input['winner'])
				 					->value('matchups');
		$loser_matchups = app('db')->table('cards')
				 				   ->where('scryfall_id', $input['loser'])
				 				   ->value('matchups');
		if($winner_matchups >= $max_matchups || $loser_matchups >= $max_matchups) {
			return response("Overplayed matchup", 403);
		}

		// Save vote
		app('db')->table('matchups')->insert($input);

		// Update card matchup values
		app('db')->table('cards')
				 ->where('scryfall_id', $input['winner'])
				 ->orWhere('scryfall_id', $input['loser'])
				 ->increment('matchups');
	}
}
