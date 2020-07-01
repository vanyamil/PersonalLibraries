<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CardController extends Controller
{
	public function name_from_id($id) {
		return name_from_id($id);
	}

	public function random() {
		// Get one random ID
		$card = app('db')->table('cards')->inRandomOrder()->value('scryfall_id');

		return redirect()->route('card', ['id' => $card]);
	}

	public function named(Request $request) {
		$name = $request->input('name');

		// Check if name is exact in our database
		$query = app('db')->table('cards')->where('name', $name);

		if($query->count() > 0) {
			$card = $query->value('scryfall_id');
			return redirect()->route('card', ['id' => $card]);
		} else {
			return redirect()->route('card', ['id' => $name]);
		}
	}

	public function view($id) {
		$card = app('db')->table('cards')->where('scryfall_id', $id)->first()
			?? $id;
		$matchups = app('db')->table('matchups')
							 ->where('winner', $id)
							 ->orWhere('loser', $id)
							 ->orderBy('voted_at')
							 ->select(['winner', 'loser', 'voted_at'])
							 ->simplePaginate(20);

		return view('card', compact('card', 'matchups'));
	}
}
