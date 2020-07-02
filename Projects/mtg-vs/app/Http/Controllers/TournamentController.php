<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Tournament;
use Carbon\Carbon;

class TournamentController extends Controller
{
	/** Show a page with a list of tournaments */
	public function index() 
	{
		$now = Carbon::now();

		$all = Tournament::where('public', true)
				->where('active', true)
				->whereDate('due_at', '<', $now)
				->get();

		[$upcoming, $started] = $all->partition('start_time', '<', $now);
		[$running, $complete] = $all->partition('due_at', '<', $now);

		return view('tournaments.index', 
			compact('upcoming', 'running', 'complete'));
	}

	/** Show an info page for a specific tournament */
	public function show($tournament) 
	{
		$tournament = Tournament::where('id', $tournament)->firstOrFail();
		return view('tournaments.show', compact('tournament'));
	}

	/** Show a page for creating a new tournament */
	public function create() 
	{
		$now = Carbon::now()->addHour();
		$plus_week = Carbon::now()->addWeek();

		return view('tournaments.create', compact('now', 'plus_week'));
	}

	/** Show a page for editing a tournament */
	public function edit($tournament, Request $request) 
	{
		$tournament = Tournament::where('id', $tournament)->firstOrFail();
		$password = $request->input('password');
		app('log')->info($request->all());
		if($password == $tournament->password)
		{
			$started = $tournament->active && $tournament->start_time->lessThan(Carbon::now());
			return view('tournaments.edit', compact('tournament', 'started'));
		}
		else
			return abort(401);
	}

	/** Create a new tournament and save it in DB */
	public function store(Request $request) {
		$inps = $request->all();

		// Generate new ID
		$id = '';
		do {
			$id = Str::random(9);
		} while(app('db')->table('tournaments')->where('id', $id)->count() > 0);

		// Prepare some fields
		$inps["start_time"] = new Carbon($inps["start_time"]);
		$inps["due_at"] = new Carbon($inps["due_at"]);
		$inps['id'] = $id;
		$password = Str::random(9);
		$inps['password'] = $password;

		// Create tournament
		$tournament = Tournament::create($inps);

		return redirect()->route('tournaments.edit', compact('tournament', 'password'));
	}
}
