<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
	public function anonymous() {
		return $this->getUser("");
	}

	public function getUser($name = "") {
		$matchups = app('db')->table('matchups')
							 ->where('voter', $name)
							 ->orderBy('voted_at', 'desc')
							 ->select(['winner', 'loser', 'ordered', 'voted_at'])
							 ->simplePaginate(20);

		$count = app('db')->table('matchups')
						  ->where('voter', $name)
						  ->count();

		return view('user', compact('name', 'matchups', 'count'));
	}
}
