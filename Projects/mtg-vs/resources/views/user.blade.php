@extends('layout')

@section('title', "User $name")

@section('style')
<style>
	.pagination {
		margin-top: 15px;
		justify-content: space-between;
	}
</style>
@endsection

@section('content')

<div class="container">

	<div class="form-row my-2 justify-content-center">
		<input type="text" class="form-control mb-2 mr-sm-2 w-25" placeholder="Username" id="username" autocomplete="off" />
		<a id="submit" class="btn btn-primary mb-2" href="/user">Search</a>
	</div>

	<h2 class="display-4 text-center">
		{{ $name ? $name . "'s votes" : "Votes without username" }} 
		<span class="badge badge-secondary">
			{{ $count }} 
		</span>
	</h2>

	<ul class="list-group">
		@foreach($matchups as $matchup)
		@php 
			if($matchup->ordered) {
				$leftside = $matchup->winner;
				$rightside = $matchup->loser;
			} else {
				$leftside = $matchup->loser;
				$rightside = $matchup->winner;
			}
		@endphp
		<li class="list-group-item">
			<div class="d-flex w-100 justify-content-between">
				<span>
					<a class="{{ $matchup->ordered ? "font-weight-bold" : "" }} text-reset" href="{{ route('card', ['id' => $leftside]) }}">
						{{ name_from_id($leftside) }}
					</a>
					 vs 
					<a class="{{ $matchup->ordered ? "" : "font-weight-bold" }} text-reset" href="{{ route('card', ['id' => $rightside]) }}">
						{{ name_from_id($rightside) }}
					</a>
				</span>
				<small>
					{{ $matchup->voted_at }}
				</small>
			</div>
		</li>
		@endforeach
	</ul>

	{{ $matchups->links() }}
</div>

@endsection

@section('scripts')
<script type="text/javascript">
	$("#username").change(() => {
		$("#submit").attr('href', '/user/' + $("#username").val());
	});
</script>
@endsection