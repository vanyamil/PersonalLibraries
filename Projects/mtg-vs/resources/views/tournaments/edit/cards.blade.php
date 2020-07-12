@extends('tournaments.edit.layout')

@section('subtitle', 'Select Cards')

@section('subcontent')

<div class="modal fade" id="add_cards" tabindex="-1" role="dialog">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Add cards</h5>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body">
				<div class="form-group">
				    <label for="single_card">Single card</label>
				    <input type="text" class="form-control" id="single_card" aria-describedby="singleHelp" />
				    <small id="singleHelp" class="form-text text-muted">
					    If you want to add one card, enter its name or a part of it, its Scryfall ID or the URL to that card's info on Scryfall (starting with https://scryfall.com/card).
					</small>
				</div>
				<div class="form-group">
				    <label for="multi_card">Scryfall query</label>
				    <input type="text" class="form-control" id="multi_card" aria-describedby="multiHelp" />
				    <small id="multiHelp" class="form-text text-muted">
					    If you want to add multiple cards, use Advanced Search on Scryfall, then copy-paste the part of the URL between "q=" and "&" or the end of the URL.
					</small>
					<div class="progress mt-3">
						<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" id="multiProgress">
						</div>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
				<button type="button" class="btn btn-primary" id="submitCard">Add</button>
			</div>
		</div>
	</div>
</div>

<div class="modal fade" id="wipe_cards" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog">
	<form action="{{ route('tournaments.cards.destroy') }}" method="post">
		@method('delete')
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Wipe cards</h5>
					<button type="button" class="close" data-dismiss="modal" aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<p> Are you sure you want to remove all {{ $participants->total() }} cards? </p>
				</div>
				<div class="modal-footer">
					<a href="#" class="btn btn-secondary" data-dismiss="modal">Close</a>
					<button type="submit" class="btn btn-danger" id="wipeCards">Wipe</button>
				</div>
			</div>
		</div>
	</form>
</div>

<div class="modal fade" id="view_card" tabindex="-1" role="dialog">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-body">
				<img src="" id="view_img" class='w-100' />
			</div>
		</div>
	</div>
</div>

<button class="btn btn-success btn-lg my-2" data-toggle="modal" data-target="#add_cards">
	<b>Add cards</b> <i class="fa fa-plus fa-lg ml-2"></i>
</button>
<button class="btn btn-danger btn-lg my-2" data-toggle="modal" data-target="#wipe_cards">
	<b>Wipe cards</b> <i class="fa fa-times fa-lg ml-2"></i>
</button>
<form id="addSingleForm" method="post" action="{{route('tournaments.cards.addSingle', compact('tournament')) }}">
	<input type="hidden" name="password" value="{{$tournament->password}}" />
	<input type="hidden" id="addSingleField" name="name" />
</form>
<form id="addMultiForm" method="post" action="{{route('tournaments.cards.addMulti', compact('tournament')) }}">
	<input type="hidden" name="password" value="{{$tournament->password}}" />
	<input type="hidden" id="addMultiField" name="names" />
</form>
<form id="deleteCardForm" method="post" action="{{route('tournaments.cards.delete', compact('tournament')) }}">
	@method('delete')
	<input type="hidden" name="password" value="{{$tournament->password}}" />
	<input type="hidden" id="deleteCardField" name="id" />
</form>

@if(count($participants))
<ul class="list-group">
	@foreach($participants as $participant)
	<li class="list-group-item">
		<div class="d-flex w-100 justify-content-between">
			<a href="#" data-route="{{route('image', ['id' => $participant->id])}}" class="view-card">
				<h5>{{$participant->name}}</h5>
			</a>
			<button class="btn btn-danger remove-card" data-id="{{$participant->id}}">
				<i class="fa fa-times"></i>
			</button>
		</div>
	</li>
	@endforeach
</ul>
{{ $participants->links('tournaments.edit.paginate', ['password' => $tournament->password]) }}
@else
<p> There are currently no cards registered. Add some to your tournament! </p>
@endif

@endsection

@section("scripts")
<script type="text/javascript">
	const pw = "{{ $tournament->password }}";

	function promiseCardIdOrName(single_card) {
		const urlPrefix = "https://scryfall.com/card/";
		const apiPrefix = "https://api.scryfall.com/cards/";

		// Is it a URL?
		if(single_card.includes("/")) {
			if(single_card.startsWith(urlPrefix)) {
				single_card = single_card.substring(urlPrefix.length);
			}

			const arr = single_card.split("/");
			const reassembled = apiPrefix + arr[0] + "/" + arr[1];

			return fetch(reassembled)
				.then(response => response.json())
				.then(json => json.id);
		}
		// It's either a name or an ID, send to server
		else {
			return Promise.resolve(single_card);
		}
	}

	function obtainFullList(query, page) {
		const apiPrefix = "https://api.scryfall.com/cards/search?q=";
		const maxDate = "+date<%3D2020-06-01";
		const link = apiPrefix + (query.startsWith("q=") ? query.substring(2) : query) + maxDate + "&page=" + page;

		return fetch(link)
			.then(response => response.json())
			.then(json => {
				const card_ids = json.data.map(c => c.id);
				$("#multiProgress").width("" + (17500 * page / json.total_cards) + "%");
				$("#multiProgress").text((175 * page) + "/" + json.total_cards);
				return Promise.resolve(json.has_more ? obtainFullList(query, page+1) : [])
					.then(arr => arr.concat(card_ids));
			})
	}

	// On adding a card
	$("#submitCard").click(ev => {
		// If single card written
		const single_card = $("#single_card").val();
		const multi_card = $("#multi_card").val();

		if(single_card != "") {
			promiseCardIdOrName(single_card)
				.then(name => {
					$("#addSingleField").val(name);
					$("#addSingleForm").submit();
				});
		} 
		else if(multi_card != "") {
			obtainFullList(multi_card, 1)
				.then(ids => {
					$("#addMultiField").val(ids.join(","));
					$("#addMultiForm").submit();
				});
		}
	});

	$(".remove-card").click(function(ev) {
		const id = $(this).data('id');
		$("#deleteCardField").val(id);
		$("#deleteCardForm").submit();
	});

	$(".view-card").click(function(ev) {
		ev.preventDefault();
		const route = $(this).data('route');
		$("#view_img").attr('src', route);
		$("#view_card").modal('show');
	});
</script>
@endsection