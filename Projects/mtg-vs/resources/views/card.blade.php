@extends('layout')

@php
$has_card = !is_string($card);
@endphp

@section('title', $has_card ? $card->name : "Card not found")

@section('content')

<div class="container">
	<form class="form-inline" action="/card/named" method="get">
		<div class="form-row my-2 w-100">
			<div class="col-md-9">
				<input type="text" class="form-control mb-2 mr-sm-2 w-100" name="name" placeholder="Card name or Scryfall ID" autocomplete="off" />
			</div>
			<div class="col-md-3">
				<button type="submit" class="btn btn-primary mb-2">Search</button>
				<a class="btn btn-warning mb-2 float-right" href="/card/random">Random</a>
			</div>
		</div>
	</form>

	@if($has_card)
	<div class="row">
		<div class="col-8 offset-2 col-md-6 offset-md-0">

			<img class="img-fluid" src="{{ route('image', ['id' => $card->scryfall_id]) }}" />
		</div>
		<div class="col-md-6">
			<div class="text-center display-3 border border-primary rounded-pill my-2" style="background-color: lavender">
				<span class="text-success">
					{{ $matchups->where('winner', $card->scryfall_id)->count() }}W
				</span>
				 - 
				<span class="text-danger">
					{{ $matchups->where('loser', $card->scryfall_id)->count() }}L
				</span>
			</div>
			<ul class="list-group list-group-flush">
				@foreach($matchups as $matchup)
				@php 
					$won = $matchup->winner == $card->scryfall_id;
					$opponent = $won ? $matchup->loser : $matchup->winner;
				@endphp
				<li class="list-group-item {{ $won ? "list-group-item-success" : "list-group-item-danger"}}">
    				<div class="d-flex w-100 justify-content-between">
    					<span>
							{{ $won ? "W" : "L" }} vs 
							<a class="font-weight-bold text-reset" href="{{ route('card', ['id' => $opponent]) }}">
								{{ name_from_id($opponent) }}
							</a>
						</span>
						<small>
							{{ $matchup->voted_at }}
						</small>
					</div>
				</li>
				@endforeach
			</ul>
		</div>
	</div>
	@else
	<p> A card with this ID or name was not found! </p>
	@endif
</div>

@endsection

@section('scripts')

@endsection