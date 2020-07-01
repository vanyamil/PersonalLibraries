@extends('layout')

@section('title', 'Vote')

@section('content')
<div class="container">
	<div class="row mt-3">
		<div class="col text-center" id="welcome">
			<h2>Welcome to MTG VS!</h2>
			<p>Press Start when you're ready to vote! </p>
			<input type="text" placeholder="Username (optional)" id="username" maxlength="20" autocomplete="off" />
			<br />
			<button class="btn btn-success my-2" id="welcome-btn">Start</button>
		</div>
		<div class="col text-center" id="hint" style="display: none">
			<p>Press on the image of the better card to vote or <button class="btn btn-warning btn-sm" id="skip-btn">skip</button>. </p>
		</div>
	</div>
	<div class="row" id="cards" style="display: none">
		<div class="col-md-6 mt-3">
			<div class="card border-secondary" id="card0-card">
				<div class="card-header">
					<h4 class="text-center font-italic" id="card0-title"></h4>
				</div>
				<a href="#" id="card0-btn">
					<img class="card-img-bottom p-2" id="card0-img" />
				</a>
			</div>
		</div>
		<div class="col-md-6 mt-3">
			<div class="card border-secondary" id="card1-card">
				<div class="card-header">
					<h4 class="text-center font-italic" id="card1-title"></h4>
				</div>
				<a href="#" id="card1-btn">
					<img class="card-img-bottom p-2" id="card1-img" />
				</a>
			</div>
		</div>
	</div>
</div>
@endsection

@section('scripts')
<script>
	let username = "";

	function regen() {
		$.getJSON("/vote/new", function(data) {
			$("#card0-btn").attr("data-id", data[0]["scryfall_id"]);
			$("#card1-btn").attr("data-id", data[1]["scryfall_id"]);
			$("#card0-img").attr("src", data[0]["link"]);
			$("#card1-img").attr("src", data[1]["link"]);
			$("#card0-title").text(data[0]["name"]);
			$("#card1-title").text(data[1]["name"]);

			$("#hint").fadeIn("fast", () => {
				$("#card0-card").removeClass("bg-success bg-danger text-white");
				$("#card1-card").removeClass("bg-success bg-danger text-white");
				$("#cards").delay(100).fadeIn();
			});
		});
	}

	$(() => {
		if (typeof(Storage) !== "undefined") {
			$("#username").val(localStorage.getItem("username") ?? '');
		}

		$("#welcome-btn").on('click', () => {
			$("#welcome").fadeOut(400, regen);
			username = $("#username").val();

			if (typeof(Storage) !== "undefined") {
				localStorage.setItem('username', username);
			}
		});

		$("#card0-btn").click(() => {
			$("#card0-card").addClass("bg-success text-white");
			$("#card1-card").addClass("bg-danger text-white");

			$.post("/vote", {
				winner: $("#card0-btn").attr("data-id"),
				loser: $("#card1-btn").attr("data-id"),
				ordered: 1,
				voter: username
			}, () => {
				$("#cards").fadeOut("fast", regen);
			});
		});

		$("#card1-btn").click(() => {
			$("#card0-card").addClass("bg-danger text-white");
			$("#card1-card").addClass("bg-success text-white");

			$.post("/vote", {
				winner: $("#card1-btn").attr("data-id"),
				loser: $("#card0-btn").attr("data-id"),
				ordered: 0,
				voter: username
			}, () => {
				$("#cards").fadeOut("fast", regen);
			});
		});

		$("#skip-btn").click(() => {
			$("#cards").fadeOut("fast", regen);
		});
	});
</script>
@endsection