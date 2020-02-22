function switchView(toAdvanced) {
	$("#row_basic").prop("hidden", toAdvanced);
	$("#row_adv").prop("hidden", !toAdvanced);
}

function getImgLink(name) {
	return "https://api.scryfall.com/cards/named?exact=" + name + "&format=image";
}

function cardView(data) {
	clearStats();

	var cardStatus = "";
	var panelClass = "";
	var round = 1;
	for(round in data.results) {
		if(data.results[round]["Percent"] < 50) {
			cardStatus = "Defeated in <b>Round " + round + "</b>";
			panelClass = "panel-danger";
			break;
		} else if(data.results[round]["Percent"] == 50) {
			cardStatus = "Competing in <b>Round " + round + "</b>";
			panelClass = "panel-warning";
			break;
		}
	}
	if (cardStatus.length == 0) {
		cardStatus = "Advances to <b>Round " + (Number(round) + 1) + "</b>";
		panelClass = "panel-success";
	}

	var cardPicLink = getImgLink(encodeURI(data.name));
	var cardLink = 'http://gatherer.wizards.com/Pages/Card/Details.aspx?name=' + encodeURI(data.name);

	var leftside = '<div class="col-md-4 col-md-offset-2">\n' +
		'<div class="panel ' + panelClass + '">\n' +
		'<div class="panel-heading text-center">' + cardStatus + '</div>' +
		'<div class="panel-body"><a href="' + cardLink + '"><img class="img-responsive center-block" src="' + cardPicLink + '" /></a></div>' +
		'</div>\n</div>\n';

	var rightside = '<div class="col-md-4"><div class="well">\n' + 
		'<div class="row"><div class="col-xs-6 table-left">Card Type: </div><div class="col-xs-6 table-right">' + data.modules.TYP + '</div></div>' +
		'<div class="row"><div class="col-xs-6 table-left">Rarity: </div><div class="col-xs-6 table-right">' + data.modules.RAR + '</div></div>' +
		'<div class="row"><div class="col-xs-6 table-left">Converted Mana Cost: </div><div class="col-xs-6 table-right">' + data.modules.CMC + '</div></div>' +
		'<div class="row"><div class="col-xs-6 table-left">Color: </div><div class="col-xs-6 table-right">' + data.modules.CLR + '</div></div>' +
		'<div class="row"><div class="col-xs-6 table-left">Strength rating: </div><div class="col-xs-6 table-right">' + data.rating + '</div></div>' +
		'<div class="row"><div class="col-xs-6 table-left">Ranking: </div><div class="col-xs-6 table-right">' + data.ranking + '</div></div>' +
		'</div></div>';

	return ('<div class="row custom-added">\n' + leftside + rightside + '<div class="col-md-2"></div></div>');
}

function listView(data, rounds) {
	clearStats();

	for(var idx in rounds) {
		roundStats(idx, rounds[idx]);
	}

	$("#accordion-master > :last-child a").click();

	if(data.length == 0)
		return $('<div><div class="row custom-added">No results found!</div></div>');

	var text = data.length == 30 ? "Here are 30 random selections:" : "Here are all the cards that fit this selection:";
	var master = $('<div><div class="row custom-added">' + text + '</div></div>');
	var parent = $('<div class="row custom-added"></div>');
	master.append(parent);

	for(var idx in data) {	
		var card = data[idx];
		var cardStatus = "";
		var panelClass = "";
		var round = 1;
		for(round in card.results) {
			if(card.results[round]["Percent"] < 50) {
				cardStatus = "Defeated in <b>Round " + round + "</b>";
				panelClass = "panel-danger";
				break;
			} else if(card.results[round]["Percent"] == 50) {
				cardStatus = "Competing in <b>Round " + round + "</b>";
				panelClass = "panel-warning";
				break;
			}
		}
		if (cardStatus.length == 0) {
			cardStatus = "Advances to <b>Round " + (Number(round) + 1) + "</b>";
			panelClass = "panel-success";
		}

		var cardPicLink = getImgLink(encodeURI(card.name));
		var cardLink = 'http://gatherer.wizards.com/Pages/Card/Details.aspx?name=' + encodeURI(card.name);

		var panel = $("<div class='panel " + panelClass + "'></div>");
		panel.append('<div class="panel-heading text-center"><i>' + card.name + '</i></div>');
		var escapedName = card.name.replace(/'/g, "\\'");
		panel.append('<div class="panel-body"><a href="javascript:namedLoad(\'' + escapedName + '\');">'+ 
				'<img class="img-responsive center-block" src="' + cardPicLink + '" /></a></div>');
		panel.append('<div class="panel-heading text-center">' + cardStatus + '</div>');

		var col = $("<div class='col-sm-4'></div>");
		col.append(panel);
		parent.append(col);

		if(idx % 3 == 2) {
			parent = $('<div class="row custom-added"></div>');
			master.append(parent);
		}
	}
	return master;

}

function opponentView(data, round) {
	var col = $("<div class='col-md-4'></div>");
	if(round in data.results) {
		var panel = $("<div class='panel'></div>");
		if(data.results[round]["Percent"] > 50)
			panel.addClass("panel-success");
		else if(data.results[round]["Percent"] == 50)
			panel.addClass("panel-warning");
		else
			panel.addClass("panel-danger");
		var escapedName = data.results[round]["Opponent"].replace(/'/g, "\\'");
		panel.append('<div class="panel-heading text-center"><i>' + data.results[round]["Opponent"] + '</i></div><div class="panel-body">' + 
			'<a href="javascript:namedLoad(\'' + escapedName + '\')"><img class="img-responsive center-block" ' + 
			'src="' + 
			getImgLink(encodeURI(data.results[round]["Opponent"])) + '" /></a></div><div class="panel-heading text-center"><b>Round ' + round + 
			', Batch ' + data.results[round]["Batch"] + (data.results[round]["Percent"] == 50 ? '</b></div>' : ':</b> ' + data.results[round]["Percent"].toFixed(2) + '%</div>'));
		col.append(panel);
	}
	return col;
}

function callPython(form) {
	$.get("/~imilos2/cgi-bin/mtgb.py?"+form.serialize(), function(data, success, xhr) {
		$(".custom-added").empty();
		if("error" in data) {
			$("#content").append("<div class='row custom-added'><div class='col-sm-12'><pre>" + data.error + "</pre></div></div>");
			return;
		} else if("list" in data) {
			$('#content').append(listView(data["list"], data["rounds"]));
			return;
		}
		$("#content").append(cardView(data));
		var rowdiv = $("<div></div>").addClass("row custom-added");
		for(var round = 1; round<15; round+=1) {
			rowdiv.append(opponentView(data, round));
		}
		$("#content").append(rowdiv);
		$("#cardPic").attr("src", getImgLink(data.name.replace(/ /g, "+")));
		lastSearches();
	});
}

function namedLoad(name) {
	$('#card-value').val(name);
	callPython($('#simpleForm'));
}

function lastSearches() {
	$.ajax({
		url: "../cgi-bin/access.log",
		dataType: "text",
		cache: false,
		success: function(data) {
			var lines = data.split("\n");
			$("#suggestions").empty();
			for(var i=2; i<=6; i++) {
				$("#suggestions").append("<a class='btn btn-info btn-block' style='white-space:normal' onclick='namedLoad(this.innerText)'>" + lines[lines.length-i].slice(12) + "</a>");
			}
		}
	});
}

function roundStats(round, numbers) {
	var new_row = $("#panel-template").clone();
	var header = new_row.find(".panel-heading a");
	header.attr("href", "#round_" + round);
	header.html("Round " + round);
	new_row.children().last().attr("id", "round_" + round);
	new_row.find(".cell-num").html(function(idx, old) { return numbers[idx]; });
	$("#panel-template").parent().append(new_row);
	new_row.show();
}

function clearStats() {
	$("#accordion-master").children(":not(:first)").remove();
}

$.get("../cgi-bin/mtgb.py?top5=1").done(function(data) {
	data.forEach(function(key) {
		$("#top5").append("<a class='btn btn-info btn-block' style='white-space:normal' onclick='namedLoad(this.innerText)'>" + key + "</a>");
	})
});

$(function(){
	$('form').submit(function(e) {
		e.preventDefault();
		callPython($(this));
	});

	$.getJSON("module_keys.json").done(function(data) {
		window.module_keys = data;
	});

	$(".dropdown-menu li a").click(function(){
		$(".dropdown-toggle").val($(this).text() + " ");
		$(".dropdown-toggle").text($(this).text() + " ");
		$(".dropdown-toggle").append("<span class='caret'></span>");
		$("#dropdown-hidden").val($(this).attr('value'));
		if($(this).attr('value') != "Batch")
			$("#filter-value").autocomplete({source: module_keys[$(this).attr('value')]});
	});

	lastSearches();
});
