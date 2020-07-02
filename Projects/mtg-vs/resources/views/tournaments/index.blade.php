@extends('layout')

@section('title', 'Tournaments')

@section('content')

<div class="container">
	<h1 class="d-block d-sm-none my-2">Tournaments</h1>
	<h2 class="display-2 d-none d-sm-block">Tournaments</h2>
	<hr />

	<div class="form-row">
		<div class="col-md-3 mb-1 mb-md-0">
			<input type="text" maxlength="9" class="form-control" placeholder="Enter 9-symbol ID" id="search-bar" autocomplete="off"></input>
		</div>
		<div class="col-md-3 mb-3 mb-md-0">
			<a class="btn btn-block btn-primary disabled" href="#" id="search-btn">Participate</a>
		</div>
		<div class="col-md-3 offset-md-3">
			<a class="btn btn-block btn-warning" href="{{route('tournaments.create')}}">Create New</a>
		</div>
	</div>
</div>

@endsection

@section('scripts')
<script type="text/javascript">
	const preroute = "{{route('tournaments.index')}}";

	$(function () {
		$("#search-bar").change(function() {
			let id = $(this).val();
			let btn = $("#search-btn");
			
			if(id.length == 9) {
				btn.removeClass("disabled");
				btn.attr("href", preroute + '/' + id);
			} else {
				btn.addClass("disabled");
				btn.attr("href", '#');
			}
		});
	});
</script>
@endsection