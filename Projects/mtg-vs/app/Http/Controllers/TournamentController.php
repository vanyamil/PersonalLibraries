<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Tournament;

class TournamentController extends Controller
{
	/** Show a page with a list of tournaments */
	public function index() 
	{
		$tournaments = Tournament::where('public', true)
						->whereDate('due_at', '<', Carbon::now()->toDateString());
		return view('tournaments.index', compact('tournaments'));
	}

	/** Show an info page for a specific tournament */
	public function show(Tournament $tournament) 
	{
		return view('tournaments.show', compact('tournament'));
	}

	/** Show a page for creating a new tournament */
	public function create() 
	{
		return view('tournaments.create');
	}
}
