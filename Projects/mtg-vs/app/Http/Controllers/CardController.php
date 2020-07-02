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
		$cardCount = Card::count();
		$counter = rand(0, $cardCount - 1);
		$id = Card::skip($counter)->value('id');

		return redirect()->route('card', compact('id'));
	}

	public function named(Request $request) {
		$name = $request->input('name');

		// Check if name is exact in our database
		$query = Card::where('name', $name);

		if($query->count() > 0) {
			$card = $query->value('id');
			return redirect()->route('card', ['id' => $card]);
		} else {
			return redirect()->route('card', ['id' => $name]);
		}
	}

	public function view($id) {
		$card = Card::find($id) ?? $id;
		$matchups = app('db')->table('matchups')
							 ->where('winner', $id)
							 ->orWhere('loser', $id)
							 ->orderBy('voted_at')
							 ->select(['winner', 'loser', 'voted_at'])
							 ->simplePaginate(20);

		return view('card', compact('card', 'matchups'));
	}
}
