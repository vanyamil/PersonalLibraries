<!DOCTYPE html>
<html lang="en">
	<head>
		<title>MTG-VS - @yield('title')</title>

	    <meta charset="utf-8">
	    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

		<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous">

		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.3/css/theme.bootstrap_4.min.css" integrity="sha256-vFn0MM8utz2N3JoNzRxHXUtfCJLz5Pb9ygBY2exIaqg=" crossorigin="anonymous" />

		@yield('style')
	</head>
	<body>
		<nav class="navbar navbar-dark bg-dark navbar-expand-sm">
			<a class="navbar-brand" href="#">MTG VS</a>
			<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbarNav">
				<ul class="navbar-nav">
					<li class="nav-item {{ request()->is('/') ? "active" : "" }}">
						<a class="nav-link" href="/">Home 
							@if(request()->is('/'))
							<span class="sr-only">(current)</span>
							@endif
						</a>
					</li>
					<li class="nav-item {{ request()->is('vote') ? "active" : "" }}">
						<a class="nav-link" href="/vote">Vote 
							@if(request()->is('vote'))
							<span class="sr-only">(current)</span>
							@endif
						</a>
					</li>
					<li class="nav-item {{ request()->is('card/*') ? "active" : "" }}">
						<a class="nav-link" href="/card/random">Card 
							@if(request()->is('card/*'))
							<span class="sr-only">(current)</span>
							@endif
						</a>
					</li>
					<li class="nav-item {{ request()->is('user/*') ? "active" : "" }}">
						<a class="nav-link" href="/user/">User 
							@if(request()->is('user/*'))
							<span class="sr-only">(current)</span>
							@endif
						</a>
					</li>
				</ul>
			</div>
		</nav>

		@yield('content')

		<script
			src="https://code.jquery.com/jquery-3.5.1.min.js"
			integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
			crossorigin="anonymous"></script>
		<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
		<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js" integrity="sha384-OgVRvuATP1z7JjHLkuOU7Xw704+h835Lr+6QL9UvYjZE3Ipu6Tp75j7Bh/kR0JKI" crossorigin="anonymous"></script>

		@yield('scripts')
	</body>
</html>