@extends('layout')

@section('title', 'Edit "' . $tournament->name . '"')

@section('content')

<div class="container-fluid">
	<h3 class="d-block d-sm-none my-2">@yield('subtitle')</h3>
	<h1 class="display-4 d-none d-sm-block">@yield('subtitle')</h1>

	<div class="form-group row">
		<label class="col-sm-3 col-form-label">
			ID
			<span class="badge badge-warning badge-pill" data-toggle="tooltip" data-placement="bottom" title="Unique ID for this tournament">?</span>
		</label>
		<div class="col-sm-9">
			<input type="text" class="form-control" readonly value="{{ $tournament->id }}">
		</div>
	</div>
	<div class="form-group row">
		<label class="col-sm-3 col-form-label">
			Password
			<span class="badge badge-warning badge-pill" data-toggle="tooltip" data-placement="bottom" title="Remember this string if you want to edit in future!">?</span>
		</label>
		<div class="col-sm-9">
			<input type="text" class="form-control" readonly value="{{ $tournament->password }}">
		</div>
	</div>
	<hr /> 
	<ul class="nav nav-tabs mb-2">
		<li class="nav-item">
			<a class="nav-link @if(request()->is("tournaments/*/edit")) active @endif " href="{{route('tournaments.edit', [
				'tournament' => $tournament->id,
				'password' => $tournament->password
			])}}">
				Tournament properties
			</a>
		</li>
		<li class="nav-item">
			<a class="nav-link @if(request()->is("tournaments/*/cards")) active @endif " href="{{route('tournaments.cards.index', [
				'tournament' => $tournament->id,
				'password' => $tournament->password
			])}}">
				Participating cards
			</a>
		</li>
		@if($tournament->type == 'fixed-pairs')
		<li class="nav-item">
			<a class="nav-link @if(request()->is("tournaments/*/matchups")) active @endif " href="{{route('tournaments.matchups.index', [
				'tournament' => $tournament->id,
				'password' => $tournament->password
			])}}">
				Matchups
			</a>
		</li>
		@endif
	</ul>
	@if($started)
	<p class="lead">The tournament can no longer be edited as it has already started!</p>
	@else
	@yield('subcontent')
	@endif
</div>

@endsection