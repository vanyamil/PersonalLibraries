@extends('layout')

@section('title', 'Edit "' . $tournament->name . '"')

@section('content')

<div class="container-fluid">
	<h3 class="d-block d-sm-none my-2">Edit a Tournament</h3>
	<h1 class="display-4 d-none d-sm-block">Edit a Tournament</h1>

	<form action="{{ route('tournaments.update', compact('tournament')) }}" method="post">
		@method('put')
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
		@if($started)
		<p class="lead">The tournament can no longer be edited as it has already started!</p>
		@else
		<a class="btn btn-primary" data-toggle="collapse" href="#collapseProps" role="button" aria-expanded="false" aria-controls="collapseProps">
			Tournament properties
		</a>
		<div class="collapse" id="collapseProps">
			<div class="form-group row">
				<label class="col-sm-3 col-form-label">
					Name
					<span class="badge badge-warning badge-pill" data-toggle="tooltip" data-placement="bottom" title="What question you want answered with this voting?">?</span>
				</label>
				<div class="col-sm-9">
					<input type="text" autocomplete="off" class="form-control" name="name" maxlength="100" required value="{{$tournament->name}}">
				</div>
			</div>
			<div class="form-group row">
				<label class="col-sm-3 col-form-label">
					Description
					<span class="badge badge-warning badge-pill" data-toggle="tooltip" data-placement="bottom" title="Any details about what to expect from this tournament">?</span>
				</label>
				<div class="col-sm-9">
					<textarea class="form-control" maxlength="1000" id="description" name="description" required rows="3">{{ $tournament->description}}</textarea>
				</div>
			</div>
			<div class="form-group row">
				<label class="col-sm-3 col-form-label">
					Type
				</label>
				<div class="col-sm-9 col-form-label">
					<div class="custom-control custom-radio custom-control-inline">
						<input disabled class="custom-control-input" type="radio" id="type-paired" {{ $tournament->type == "fixed-pairs" ? "checked" : "" }} >
						<label class="custom-control-label" for="type-paired">Fixed pairings</label>
					</div>
					<div class="custom-control custom-radio custom-control-inline">
						<input disabled class="custom-control-input" type="radio" id="type-rr"  {{ $tournament->type == "round-robin" ? "checked" : "" }} >
						<label class="custom-control-label" for="type-rr">Round Robin</label>
					</div>
				</div>
			</div>
			<div class="form-group row">
				<label class="col-sm-3 col-form-label">
					Availability
					<span class="badge badge-warning badge-pill" data-toggle="tooltip" data-placement="bottom" title="Public tournaments are visible on the tournaments list page">?</span>
				</label>
				<div class="col-sm-9 col-form-label">
					<div class="custom-control custom-radio custom-control-inline">
						<input class="custom-control-input" type="radio" name="public" value="1" id="avail-public" checked>
						<label class="custom-control-label" for="avail-public">Public</label>
					</div>
					<div class="custom-control custom-radio custom-control-inline">
						<input class="custom-control-input" type="radio" name="public" value="0" id="avail-private">
						<label class="custom-control-label" for="avail-private">Private</label>
					</div>
				</div>
			</div>
			<div class="form-group row">
				<label class="col-12 col-md-3 col-form-label">
					Start date/time
				</label>
				<div class="col-6 col-md-4 col-lg-3">
					<input type="date" class="form-control start-date" min="{{ $tournament->start_time->toDateString() }}" max="2030-01-01" id="start-date" value="{{ $tournament->start_time->toDateString() }}">
				</div>
				<div class="col-6 col-md-4 col-lg-3">
					<input type="time" class="form-control start-date" id="start-time" value="{{ $tournament->start_time->toTimeString('minute') }}">
				</div>
				<label class="col-12 col-lg-3 col-form-label" id="start-date-label"></label>
				<input type="hidden" name="start_time" value="{{ $tournament->start_time }}" id="hidden-start-date" />
			</div>
			<div class="form-group row">
				<label class="col-12 col-md-3 col-form-label">
					Closing date/time
				</label>
				<div class="col-6 col-md-4 col-lg-3">
					<input type="date" class="form-control end-date" value="{{ $tournament->due_at->toDateString() }}" min="{{ $tournament->start_time->toDateString() }}" max="2030-01-01" id="end-date">
				</div>
				<div class="col-6 col-md-4 col-lg-3">
					<input type="time" class="form-control end-date" id="end-time" value="{{ $tournament->due_at->toTimeString('minute') }}">
				</div>
				<label class="col-12 col-lg-3 col-form-label" id="end-date-label"></label>
				<input type="hidden" name="due_at" value="{{ $tournament->due_at }}" id="hidden-end-date" />
			</div>
			<hr />
		</div>
		<a class="btn btn-primary" data-toggle="collapse" href="#collapseCards" role="button" aria-expanded="false" aria-controls="collapseCards">
			Participating cards
		</a>
		<div class="collapse show" id="collapseCards">
			<div class="form-group row">
			</div>
			<hr />
		</div>
		<div class="form-group row">
			<div class="col text-right">
				<input class="btn btn-danger" type="submit" value="Update" />
			</div>
		</div>
		@endif
	</form>
</div>

@endsection

@section('scripts')
<script type="text/javascript">
	function regenDate(whichDate) {
		const newDate = $("#" + whichDate + "-date").val();
		const newTime = $("#" + whichDate + "-time").val();
		const dateObj = new Date(newDate + "T" + newTime + "Z");
		console.log(dateObj);
		$("#" + whichDate + "-date-label").text(dateObj.toUTCString());
		$("#hidden-" + whichDate + "-date").val(dateObj.toUTCString());
	}

	$(function () {
		$('[data-toggle="tooltip"]').tooltip();

		$('.start-date').change(() => regenDate("start"));
		regenDate("start");

		$('.end-date').change(() => regenDate("end"));
		regenDate("end");
	});
</script>
@endsection