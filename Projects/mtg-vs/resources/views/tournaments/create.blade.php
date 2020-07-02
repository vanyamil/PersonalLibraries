@extends('layout')

@section('title', 'Create a Tournament')

@section('content')

<div class="container-fluid pt-3">
	<h3 class="d-block d-sm-none my-2">Create a Tournament</h3>
	<h1 class="display-4 d-none d-sm-block">Create a Tournament</h1>
	<hr />

	<form action="{{ route('tournaments.store') }}" method="post">
		<div class="form-group row">
			<label class="col-sm-3 col-form-label">
				Name
				<span class="badge badge-warning badge-pill" data-toggle="tooltip" data-placement="bottom" title="What question you want answered with this voting?">?</span>
			</label>
			<div class="col-sm-9">
				<input type="text" autocomplete="off" class="form-control" name="name" maxlength="100" required>
			</div>
		</div>
		<div class="form-group row">
			<label class="col-sm-3 col-form-label">
				Description
				<span class="badge badge-warning badge-pill" data-toggle="tooltip" data-placement="bottom" title="Any details about what to expect from this tournament">?</span>
			</label>
			<div class="col-sm-9">
				<textarea class="form-control" maxlength="1000" id="description" name="description" required rows="3"></textarea>
			</div>
		</div>
		<div class="form-group row">
			<label class="col-sm-3 col-form-label">
				Type
			</label>
			<div class="col-sm-9 col-form-label">
				<div class="custom-control custom-radio custom-control-inline">
					<input class="custom-control-input" type="radio" name="type" value="fixed-pairs" id="type-paired" checked>
					<label class="custom-control-label" for="type-paired">Fixed pairings</label>
				</div>
				<div class="custom-control custom-radio custom-control-inline">
					<input class="custom-control-input" type="radio" name="type" value="round-robin" id="type-rr">
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
				<input type="date" class="form-control start-date" min="{{ $now->toDateString() }}" max="2030-01-01" id="start-date" value="{{ $now->toDateString() }}">
			</div>
			<div class="col-6 col-md-4 col-lg-3">
				<input type="time" class="form-control start-date" id="start-time" value="{{ $now->toTimeString('minute') }}">
			</div>
			<label class="col-12 col-lg-3 col-form-label" id="start-date-label"></label>
			<input type="hidden" name="start_time" value="{{ $now }}" id="hidden-start-date" />
		</div>
		<div class="form-group row">
			<label class="col-12 col-md-3 col-form-label">
				Closing date/time
			</label>
			<div class="col-6 col-md-4 col-lg-3">
				<input type="date" class="form-control end-date" value="{{ $plus_week->toDateString() }}" min="{{ $now->toDateString() }}" max="2030-01-01" id="end-date">
			</div>
			<div class="col-6 col-md-4 col-lg-3">
				<input type="time" class="form-control end-date" id="end-time" value="{{ $plus_week->toTimeString('minute') }}">
			</div>
			<label class="col-12 col-lg-3 col-form-label" id="end-date-label"></label>
			<input type="hidden" name="due_at" value="{{ $plus_week }}" id="hidden-end-date" />
		</div>
		<hr />
		<div class="form-group row">
			<div class="col text-right">
				<input class="btn btn-primary" type="submit" />
			</div>
		</div>
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