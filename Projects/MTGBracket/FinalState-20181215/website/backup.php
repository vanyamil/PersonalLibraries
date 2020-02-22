<!DOCTYPE html>
<html>
<head>
	<title> Magic Bracket Stats </title>
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
	<script src="mtgb.js"></script>
	<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
	<div class="container-fluid">
		<div class="page-header">
			<h2 class="text-center">The Magic Bracket - Stats and Review v0.4.5</h2>
			<h5 class="text-center">Click on images to see the Gatherer page!</h5>
		</div>
		<div class="row">
			<div class="col-sm-2">
				<ul class="nav nav-pills nav-stacked">
					<li>
						<a href="/~imilos2/">Home</a>
					</li>
					<li>
						<a href="/~imilos2/orbitSim">Space Elevator Operator</a>
					</li>
					<li class="active">
						<a href="/~imilos2/MTGB">Magic Bracket</a>
					</li>
				</ul>
			</div>
			<div class="col-sm-8" id="content">
				<br />
				<form class="form-inline">
					<div class="row" id="row_basic">
						<label class="col-sm-4 control-label">
							Single card statistics
						</label>
						<div class="col-sm-4">
							<div class="input-group">
								<input type="text" placeholder="Choose your card" class="form-control" name="card-value" id='card-value' />
								<div class="input-group-btn">
									<button type="submit" value="Card statistics" class="btn btn-default" name="card-submit">
										<i class="glyphicon glyphicon-search"></i>
									</button>
								</div>
							</div>
						</div>
					</div>

					<div class="row" id="row_adv" hidden>
						<label class="col-sm-4 control-label">Choose a filter</label>
						<div class="col-sm-4 dropdown">
							<button class="btn btn-default dropdown-toggle" id="filters" data-toggle="dropdown">
								Filters
								<span class="caret"></span>
							</button>
							<ul class="dropdown-menu" role="menu" aria-labelledby="filters">
								<li role="presentation"><a role="menuitem" href="#">TYP</a></li>
								<li role="presentation"><a role="menuitem" href="#">CMC</a></li>
							</ul>
							<input type="text" name="filter-value"/>
							<button type="submit" value="Filter" class="btn btn-default" name="filter-submit">
								<i class="glyphicon glyphicon-search"></i>
							</button>
						</div>
						<div class="col-sm-4">
							<a class="btn btn-primary" onclick="switchView(false)">Single Card Search</a>
						</div>
					</div>

				</form>
				<br />
			</div>
			<div class="col-sm-2 text-center well lead">
				Last searches:
				<div id="suggestions" class="btn-group-vertical center-block"></div>
			</div>
		</div>
	</div>
</body>
</html>
