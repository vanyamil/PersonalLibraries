<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class VoteController extends Controller
{
	public function generate($tournament) {

		// For round-robin - just random 2 cards
		if($tournament->type == "round-robin") {
			[$card1, $card2] = Card::inTournament($tournament)
								->inRandomOrder()
								->take(2)
								->get();
		} else {
			// In fixed-pairs, return an existing matchup instead
			// TODO add voter tracking, and maybe randomization of sides?

			[$card1, $card2] = Matchup::where('tournament_id', $tournament)
									->inRandomOrder()
									->first()
									->cards();
		}

		return [$card1, $card2];
	}

	public function save_vote($tournament, Request $request) {
		// TODO fully

		$input = $request->all(); 
		// winner, loser, ordered - rest is auto-populated

		// Extra check for matchups
		$max_matchups = max_matchups();
		$winner_matchups = Card::find($input['winner'], 'matchups');
		$loser_matchups = Card::find($input['loser'], 'matchups');
		if($winner_matchups >= $max_matchups || $loser_matchups >= $max_matchups) {
			return response("Overplayed matchup", 403);
		}

		// Save vote
		Vote::insert($input);

		// Update card matchup values
		Card::whereKey([$input['winner'], $input['loser']])
			->increment('matchups');
	}
}
