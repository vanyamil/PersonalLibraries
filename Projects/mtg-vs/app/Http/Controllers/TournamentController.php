<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

use App\Card;
use App\Tournament;

class TournamentController extends Controller
{
	public function __construct() 
	{
		$this->middleware('edit_tour', ['except' => [
			'index',
			'show',
			'create',
			'store'
		]]);
	}

	/** Show a page with a list of tournaments */
	public function index() 
	{
		$now = Carbon::now();

		$all = Tournament::where('public', true)
				->where('active', true)
				->orderBy('due_at', 'asc')
				->get();

		[$upcoming, $started] = $all->partition('start_time', '>', $now);
		[$running, $complete] = $started->partition('due_at', '>', $now);

		return view('tournaments.index', 
			compact('upcoming', 'running', 'complete'));
	}

	/** Show an info page for a specific tournament */
	public function show($tournament) 
	{
		$tournament = Tournament::findOrFail($tournament);
		return view('tournaments.show', compact('tournament'));
	}

	/** Show a page for creating a new tournament */
	public function create() 
	{
		$now = Carbon::now()->addHour();
		$plus_week = Carbon::now()->addWeek();

		return view('tournaments.create', compact('now', 'plus_week'));
	}

	/** Create a new tournament and save it in DB */
	public function store(Request $request) 
	{
		$inps = $request->all();

		// Generate new ID
		$id = '';
		do {
			$id = Str::random(9);
		} while(!is_null(Tournament::find($id)));

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

	/** Show a page for editing a tournament */
	public function edit($tournament, Request $request) 
	{
		$tournament = Tournament::findOrFail($tournament);
		
		$started = $tournament->active && $tournament->start_time->lessThan(Carbon::now());
		return view('tournaments.edit.index', compact('tournament', 'started'));
	}

	/** Edit an existing tournament */
	public function update($tournament, Request $request) 
	{
		$inps = $request->except(['_method', 'password']);
		$password = $request->input('password');
		
		$inps["start_time"] = new Carbon($inps["start_time"]);
		$inps["due_at"] = new Carbon($inps["due_at"]);

		Tournament::whereKey($tournament)->update($inps);

		return redirect()->route('tournaments.edit', compact('tournament', 'password'));
	}

	/** View the list of participating cards */
	public function cards($tournament, Request $request) 
	{
		$tournament = Tournament::findOrFail($tournament);

		$participants = $tournament->cards()->orderBy('name')->paginate(20);
		$started = $tournament->active && $tournament->start_time->lessThan(Carbon::now());

		return view('tournaments.edit.cards', compact('tournament', 'participants', 'started'));
	}

	/** Add a single card to the tournament */
	public function addSingle($tournament, Request $request) 
	{
		$tournament = Tournament::whereKey($tournament)->with('cards')->first();
		$password = $request->input('password');
		$name_or_id = $request->input('name');

		$card = Card::where(Str::isUuid($name_or_id) ? 'id' : 'name', $name_or_id)->firstOrFail();

		if(is_null($tournament->cards()->find($card->id)))
			$tournament->cards()->attach($card);

		$tournament->update(['active' => 1]);

		return redirect()->route('tournaments.cards.index', compact('tournament', 'password'));
	}

	/** Add many card to the tournament */
	public function addMulti($tournament, Request $request) 
	{
		$password = $request->input('password');
		$names = $request->input('names');

		// Add all new cards without removing old ones or duplicate issues
		$names = explode(",", $names);
		$values = array_map(function($id) use($tournament) { 
				return ['card_id' => $id, 'tournament_id' => $tournament];
			}, $names);

		// This is a long and tedious task with attach/sync, as it doesn't do batch processing! Manually batch insert instead.
		app('db')->table('participations')->insertOrIgnore($values);

		Tournament::whereKey($tournament)->update(['active' => 1]);

		return redirect()->route('tournaments.cards.index', compact('tournament', 'password'));
	}

	/** Remove all participants from a tournament */
	public function destroyCards($tournament, Request $request) 
	{
		app('db')->table('participations')
			->where('tournament_id', $tournament)
			->delete();

		$password = $request->input('password');
		return redirect()->route('tournaments.cards.index', compact('tournament', 'password'));
	}

	/** Remove a single participant from a tournament */
	public function deleteCard($tournament, Request $request)
	{
		$card = $request->input('id');
		Tournament::find($tournament)->cards()->detach($card);

		$password = $request->input('password');
		return redirect()->route('tournaments.cards.index', compact('tournament', 'password'));
	}
}
