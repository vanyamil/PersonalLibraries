#!/usr/bin/env python

import json
from random import sample

class Module:
	"Implementations require `_description`, `_key`, `_type` fields"

	_ARRAY, _STRING, _INTEGER = 0, 1, 2
	
	@classmethod
	def parse(_, card):
		raise NotImplementedError()

	@classmethod
	def setcard(_, cardset, card): 
		return [x for x in setDB.allSets[cardset]["cards"] if x["name"] == card["name"]][0]
	
class CMC(Module):
	_description = "Converted Mana Cost"
	_key = "CMC"
	_type = Module._INTEGER
  
	@classmethod
	def parse(_, card):
		return card["cmc"] if "cmc" in card else (-1 if "Land" in card["types"] else 0)
	
class Type(Module):
	_description = "Card Types"
	_key = "TYP"
	_type = Module._STRING

	@classmethod
	def parse(_, card):
		return (" ".join(card["supertypes"]) + " " if "supertypes" in card else "")+" ".join(card["types"])
	
class Color(Module):
	_description = "Card Colors"
	_key = "CLR"
	_type = Module._STRING

	_colorCombos = {
		(										"Green"	):"Green",
		(								"Red"			):"Red",
		(								"Red", 	"Green"	):"Gruul",
		(					"Black"						):"Black",
		(					"Black", 			"Green"	):"Golgari",
		(					"Black", 	"Red"			):"Rakdos",
		(					"Black", 	"Red", 	"Green"	):"Jund",
		(			"Blue"								):"Blue",
		(			"Blue", 					"Green"	):"Simic",
		(			"Blue", 			"Red"			):"Izzet",
		(			"Blue", 			"Red", 	"Green"	):"Temur",
		(			"Blue", "Black"						):"Dimir",
		(			"Blue", "Black", 			"Green"	):"Sultai",
		(			"Blue", "Black", 	"Red"			):"Grixis",
		(			"Blue", "Black", 	"Red", 	"Green"	):"Yidris",
		("White"										):"White",
		("White", 								"Green"	):"Selesnya",
		("White", 						"Red"			):"Boros",
		("White", 						"Red", 	"Green"	):"Naya",
		("White", 			"Black"						):"Orzhov",
		("White", 			"Black", 			"Green"	):"Abzan",
		("White", 			"Black", 	"Red"			):"Mardu",
		("White", 			"Black", 	"Red", 	"Green"	):"Saskia",
		("White", 	"Blue"								):"Azorius",
		("White", 	"Blue", 					"Green"	):"Bant",
		("White", 	"Blue", 			"Red"			):"Jeskai",
		("White", 	"Blue", 			"Red", 	"Green"	):"Tiro",
		("White", 	"Blue", "Black"						):"Esper",
		("White", 	"Blue", "Black", 			"Green"	):"Atraxa",
		("White", 	"Blue", "Black", 	"Red"			):"Breya",
		("White", 	"Blue", "Black", 	"Red", 	"Green"	):"Rainbow"
	}

	@classmethod
	def parse(cls, card):
		if "colors" not in card: return "Colorless"
		if len(card["colors"]) == 1: return card["colors"][0]
		return cls._colorCombos[tuple(card["colors"])] if tuple(card["colors"]) in cls._colorCombos else "Unknown"
	
class Rarity(Module):
	_description = "Card Rarity"
	_key = "RAR"
	_type = Module._STRING

	_locallist = ["Basic Land", "Common", "Uncommon", "Rare", "Mythic Rare", "Special"]

	@classmethod
	def parse(cls, card):
		list_ = [Module.setcard(cardset, card)["rarity"] for cardset in card["printings"]]
			
		return cls._locallist[max([cls._locallist.index(r) for r in list_])]
	
class Set(Module):
	_description = "Card Sets/Printings"
	_key = "SET"
	_type = Module._ARRAY

	@classmethod
	def parse(_, card):
		return card["printings"]
	
class Keywords(Module):
	import string

	_description = "Card Keywords"
	_key = "KWD"
	_type = Module._ARRAY

	_keywords = ['Creature', 'You', 'Target', 'This', 'Card', 'End', 'Damage', 'Until', 'From', 'Player', 'Enters', 'Mana', 'Creatures', 
		'Cast', 'Control', 'Whenever', 'Deals', 'Counter', 'Sacrifice', 'Cards', 'Beginning', 'Flying', 'Battlefield', 'Then', 'Draw', 'Return', 
		'Exile', 'Destroy', 'Enchanted', 'Library', 'Her', 'Graveyard', 'Counters', 'Land', 'Gains', 'Untap', 'Number', 'Opponent', 'Spell', 'Blocked', 
		'One', 'Create', 'Enchant', 'Cost', 'Artifact', 'Choose', 'Becomes', 'Have', 'Discard', 'Combat', 'Turn', 'Equal', 'Would', 'Other', 'Time', 
		'More', 'Dealt', 'Power', 'Under', 'Three', 'Unless', 'Face', 'Reveal', 'Life', 'First', 'Tap', 'Another', 'Controls', 'Hand', 'Remove', 
		'Shuffle', 'Search', 'During', 'Permanent', 'Black', 'Green', 'Ability', 'Trample', 'Spells', 'Converted', 'Activate', 'White', 'Block', 
		'Token', 'Loses', 'Prevent', 'Color', 'Additional', 'Controller', 'Haste', 'Defending', 'Where', 'Without', 'Strike', 'Discards', 'Less', 
		'Attacking', 'Red', 'Except', 'Attack', 'Among', 'Those', 'Equip', 'Toughness', 'Four', 'Morph', 'Equipped', 'Bottom', 'Protection', 'Their', 
		'Copy', 'Them', 'Colorless', 'Regenerate', 'Chosen', 'Blue', 'Attacks', 'Instant', 'Blocking', 'Basic', 'Sorcery', 'Nonland', 'Paying', 
		'Sacrifices', 'Goblin', 'Permanents', 'Down', 'Lands', 'Spirit', 'Upkeep', 'Could', 'Flashback', 'Reveals', 'Rest', 'Tapped', 'Defender', 
		'Exiled', 'Opponents', 'Abilities', 'Type', 'Charge', 'Play', 'Untapped', 'Targets', 'Choice', 'Name', 'Flash', 'Named', 'Vigilance', 'Players', 
		'Enchantment', 'Dragon', 'Seven', 'Blocks', 'Casts', 'Costs', 'Draws', 'Attach', 'Before', 'Instead', 'Same', 'Attached', 'Elemental', 'Leaves', 
		'Revealed', 'Many', 'Though', 'Source', 'Zombie', 'Pool', 'There', 'Five', 'Double', 'Noncreature', 'Way', 'Addition', 'Shuffles', 'Scry', 
		'Reach', 'Cycling', 'Tokens', 'Amount', 'Level', 'While', 'Still', 'Total', 'Deathtouch', 'Paid', 'Aura', 'Lifelink', 'Transform', 'Arcane', 
		'Sacrificed', 'Roll', 'Chooses', 'Echo', 'Soldier', 'Madness', 'Indestructible', 'Greater', 'Nontoken', 'Devoid', 'Rather', 'Once', 'Artifacts', 
		'Turned', 'Nonblack', 'Being', 'Game', 'Activated', 'Step', 'Random', 'Cumulative', 'Poison', 'Kicker', 'Least', 'Sliver', 'Spent', 'Forest', 
		'Causes', 'Types', 'Effect', 'Planeswalker', 'Threshold', 'Share', 'Shroud', 'Legendary', 'Either', 'After', 'Snow', 'Wall', 'Comes', 'Saproling', 
		'Flip', 'Giant', 'Enough', 'Exiles', 'Banding', 'Enter', 'Warrior', 'Hexproof', 'Ally', 'Equipment', 'Landfall', 'Flanking', 'Bestow', 'Eldrazi', 
		'Remains', 'Beast', 'Become', 'Change', 'Angel', 'Fear', 'Spend', 'Phases', 'Shadow', 'Attacked', 'Devotion', 'Casting', 'Island', 'Since', 
		'Swamp', 'Megamorph', 'Creates', 'Plains', 'Returns', 'Most', 'Golem', 'Attackers', 'Wolf', 'Quest', 'Effects', 'Phyrexian', 'Destroyed', 
		'Infect', 'Wurm', 'Vampire', 'Splice', 'Mountain', 'Shares', 'Knight', 'Divided', 'Lasts', 'Energy', 'Swampwalk', 'Menace', 'Draft', 'Scheme', 
		'Colors', 'Storage', 'Nonbasic', 'Suspend', 'Beyond', 'Human', 'Lightning', 'Entwine', 'Unearth', 'Fire', 'Countered', 'Champion', 'Kavu', 
		'Bands', 'Assign', 'Removed', 'Text', 'Merfolk', 'Tied', 'Rounded', 'Extra', 'Cause', 'Islandwalk', 'Delirium', 'Drake', 'Forestwalk', 'Storm', 
		'Exchange', 'Twice', 'Main', 'Blood', 'Represents', 'Heroic', 'Conspiracy', 'Hydra', 'Starting', 'Spore', 'Paired', 'Divide', 'Bushido', 'Back', 
		'Discarded', 'Multicolored', 'Shaman', 'Horror', 'Evoke', 'Times', 'Command', 'Lost', 'Treefolk', 'Bird', 'Blockers', 'Prevented', 'Intimidate', 
		'Slivers', 'Second', 'Exalted', 'Spike', 'Depletion', 'Died', 'Convoke', 'Instances', 'Single', 'Fewer', 'Able', 'Again', 'Emblem', 'Exactly', 
		'Hidden', 'Clash', 'Surge', 'Controlled', 'Centaur', 'Kithkin', 'Returned', 'Buyback', 'Overload', 'Prowess', 'Cycle', 'Remain', 'Clockwork', 
		'Domain', 'Phased', 'Changeling', 'Maximum', 'Highest', 'Faerie', 'Treated', 'Scion', 'Ogre', 'Monstrosity', 'Every', 'Metalcraft']

	@classmethod
	def parse(cls, card):
		return [x for x in cls._keywords if x.lower() in card["text"].lower()] if "text" in card else []
	
class Artist(Module):
	_description = "Printings Artists"
	_key = "ART"
	_type = Module._ARRAY

	@classmethod
	def parse(_, card):
		list_ = [Module.setcard(cardset, card)["artist"] for cardset in card["printings"]]
		return list(set(list_))

class Filters:
	@classmethod
	def batch(_, round_, start, stop):
		return lambda results, _: str(round_) in results and results[str(round_)]["Batch"] >= int(start) and results[str(round_)]["Batch"] <= int(stop) 

	@classmethod
	def round_(_, n):
		return lambda results, _: str(n) in results.keys() 

	@classmethod
	def module(_, name, value):
		return lambda _, modules: (modules != None and name in modules.keys() and 
			((type(modules[name]) is list and value in modules[name]) or 
			(type(modules[name]) is int and int(value) == modules[name]) or 
			(value == modules[name]))
			)

	@classmethod
	def and_(_, list_):
		return lambda results, modules: sum([f(results, modules) for f in list_]) == len(list_)

	@classmethod
	def or_(_, list_):
		return lambda results, modules: sum([f(results, modules) for f in list_]) != 0

class Summaries:
	@classmethod
	def name(_, name, results, modules):
		return name

	@classmethod
	def results(_, name, results, modules):
		return results

	@classmethod
	def modules(_, name, results, modules):
		return modules

	@classmethod
	def full(_, name, results, modules):
		return dict(zip(["name", "results", "modules"], [name, results, modules]))

class Reddit:
	@classmethod
	def parseResults(_, round_, batch, text_):
		db = Database(False)
		for line in text_.splitlines():
			winner = line[:line.find(" defeats ")].replace("\x92", "'").replace("\xc3\xa9", "\xe9")
			loser = line[line.find(" defeats ") + 9:line.rfind(" with ")].replace("\x92", "'")
			percent = float(line[line.rfind(" with ")+6:line.rfind("%")])
			delta = round(percent*2-100, 2)

			winner = unicode(winner.split(" // ")[0], "windows-1252")
			loser = unicode(loser.split(" // ")[0], "windows-1252")
			db.addResults(winner, loser, percent, round_, batch)

		db.save()

	@classmethod
	def batch(cls, round_, batch_):
		return cls.main((round_, batch_, batch_), [Color(), Type(), CMC()])

	@classmethod
	def week(cls, round_, week_):
		return cls.main((round_, week_*7-6, week_*7), [CMC(), Type(), Color(), Rarity(), Set(), Artist()]) 

	@classmethod
	def main(_, filterT, moduleList):
		db = Database(True)
		round_ = filterT[0]
		cards = db.filter(
			Filters.batch(filterT[0], filterT[1], filterT[2]), 
			lambda name, results, modules: (name, results[str(round_)]["Percent"], modules)
		)

		bestVoted = max(cards, key=lambda x:x[1])
		bestVoted = ("[[%s]] vs [[%s]]" % (bestVoted[0], db[bestVoted[0]]["results"][str(round_)]["Opponent"]), bestVoted[1], bestVoted[2])
		worstVoted = min([x for x in cards if x[1]>50], key=lambda x:x[1])
		worstVoted = ("[[%s]] vs [[%s]]" % (worstVoted[0], db[worstVoted[0]]["results"][str(round_)]["Opponent"]), worstVoted[1], worstVoted[2])

		bestRated = min(cards, key = lambda x: db[x[0]]["ranking"])
		bestRated = [bestRated[0], db[bestRated[0]]["ranking"], db[bestRated[0]]["rating"]]
		worstRated = max(cards, key = lambda x: db[x[0]]["ranking"])
		worstRated = [worstRated[0], db[worstRated[0]]["ranking"], db[worstRated[0]]["rating"]]

		tables = {}

		for module in moduleList:
			table = {}
			for card in cards:
				if module._type is Module._ARRAY:
					for value in card[2][module._key]:
						try:
							table[value][int(card[1] < 50)] += 1
							table[value][2] += card[1]
						except KeyError:
							table[value] = [int(card[1] > 50), int(card[1] < 50), card[1]]
				else:
					try:
						table[card[2][module._key]][int(card[1] < 50)] += 1
						table[card[2][module._key]][2] += card[1]
					except KeyError:
						table[card[2][module._key]] = [card[1] > 50, card[1] < 50, card[1]]
			tables[module._description] = table

		# Strength ratings
		str_table = []
		for card in cards:
			dbf = db[card[0]]
			str_table.append((card[0], dbf['rating'], dbf['ranking']))

		str_table = sorted(str_table, key=lambda x: x[2])

		return (bestVoted, worstVoted, tables, bestRated, worstRated, str_table)

	@classmethod
	def text(cls, type_, round_, batch_):
		bestVoted, worstVoted, tables, bestRated, worstRated, str_table = cls.batch(round_, batch_) if type_ == "Batch" else (cls.week(round_, batch_) if type_ == "Week" else cls.main((round_, batch_[0], batch_[1]), [CMC(), Type(), Color(), Rarity(), Set(), Artist(), Keywords()]))
		if type_ != "Week" and type_ != "Batch":
			batch_ = 0
		ret = """**Round %d, Batch %d - Daily Analysis** *by vanyamil*  

  

Category|Side|Result|  
:--|:--|:--|:--  
Victory Margin|Highest|%s|%.2f%%  
 |Lowest|%s|%.2f%%  
Strength Rating|Best|%s|%d (%.2f)  
 |Worst|%s|%d (%.2f)  
""" % (round_, batch_, bestVoted[0], bestVoted[1], worstVoted[0], worstVoted[1], bestRated[0], bestRated[1], bestRated[2], worstRated[0], worstRated[1], worstRated[2])
		
		for module in tables:
			recordList = sorted(tables[module], key=lambda x: tables[module][x][0] - tables[module][x][1], reverse=True)
			voteList = sorted(tables[module], key=lambda x: tables[module][x][2] / (tables[module][x][0] + tables[module][x][1]), reverse=True)
			ret += """%s|Best|%s|%d  
 |Worst|%s|%d  
 |Best vote|%s|%.2f%%  
 |Worst vote|%s|%.2f%%  
""" % (module, str(recordList[0]), tables[module][recordList[0]][0] - tables[module][recordList[0]][1], str(recordList[-1]), tables[module][recordList[-1]][0] - tables[module][recordList[-1]][1], str(voteList[0]), tables[module][voteList[0]][2] / (tables[module][voteList[0]][0] + tables[module][voteList[0]][1]), str(voteList[-1]), tables[module][voteList[-1]][2] / (tables[module][voteList[-1]][0] + tables[module][voteList[-1]][1]))

		ret += "\n**Tables:**  \n"

		for module in tables:
			ret += "\n%s|Record|Vote share  \n:--|:--|:--  \n" % (module)
			recordList = sorted(tables[module], key=lambda x: tables[module][x][0] - tables[module][x][1], reverse=True)
			for key in recordList:
				ret+="%s|%d-%d|%.2f  \n" % (key if type(key) is not int else str(key), tables[module][key][0], tables[module][key][1], tables[module][key][2] / (tables[module][key][0] + tables[module][key][1]))

		ret += "\nCard|Rating|Ranking  \n:--|:--|:--  \n"
		for rec in str_table:
			ret += "%s|%.2f|%d  \n" % rec

		return ret

class Database:
	import json
	_RESULTS_PATH = "results.json"
	_RATINGS_PATH = "ratings.json"
	_MODULES_PATH = "modules.json"
	_ALLCARDS_PATH = "res/json/AllCards-x.json"
	_ALLSETS_PATH = "res/json/AllSets-x.json"
	
	def __init__(self, load_modules):
		with open(Database._RESULTS_PATH) as f:
			self.results = self.json.loads(f.read().decode("windows-1252"))
		with open(Database._RATINGS_PATH) as f:
			self.ratings = self.json.loads(f.read().decode("windows-1252"))
		self.rankings = sorted(self.ratings.keys(), key = lambda x : self.ratings[x], reverse=True)
		if load_modules:
			with open(Database._MODULES_PATH) as f:
				self.modules = self.json.loads(f.read().decode("windows-1252"))
				
	def __getitem__(self, key):
		ret = {}
		ret["name"] = key
		ret["results"] = self.results[key]
		ret["rating"] = self.ratings[key]
		ret["ranking"] = self.rankings.index(ret["name"]) + 1
		if hasattr(self, "modules") and key in self.modules:
			ret["modules"] = self.modules[key]
		return ret

	def rating(self, card, round_ = None):
		rating = 100.0
		round_ = int(round_)
		if round_ is 0:
			return rating
		results = self.results[card]
		for r in (sorted(results.keys(), key = int) if round_ is None else range(1, round_+1)):
			opponent = results[str(r)]["Opponent"]
			rating = (rating + self.rating(opponent, int(r) - 1)) * results[str(r)]["Percent"] / 100
		return round(rating, 2)

	def loadMTGJSON(self):
		with open(Database._ALLCARDS_PATH) as f:
			self.allCards = self.json.load(f, encoding="windows-1252")
		with open(Database._ALLSETS_PATH) as f:
			self.allSets = self.json.load(f, encoding="windows-1252")

	def save(self):
		with open(Database._RESULTS_PATH, "w") as f:
			self.json.dump(self.results, f, encoding="windows-1252", indent=4)
		with open(Database._RATINGS_PATH, "w") as f:
			self.json.dump(self.ratings, f, encoding="windows-1252")
		if hasattr(self, "modules"):
			with open(Database._MODULES_PATH, "w") as f:
				self.json.dump(self.modules, f, encoding="windows-1252", indent=4)

	def addResults(self, winner, loser, percent, round_, batch_):
		result_keys = ["Batch", "Opponent", "Percent"]
		winner_values = [batch_, loser, percent]
		loser_values = [batch_, winner, 100-percent]
		if winner not in self.results:
			self.results[winner] = {}
		self.results[winner][str(round_)] = dict(zip(result_keys, winner_values))
		if loser not in self.results:
			self.results[loser] = {}
		self.results[loser][str(round_)] = dict(zip(result_keys, loser_values))
		# Update the card ratings
		if(percent > 50):
			self.ratings[winner] = self.rating(winner, round_)
			self.ratings[loser] = self.rating(loser, round_)

	def filter(self, l, return_ = Summaries.name):
		if hasattr(self, "modules"):
			return [return_(x, self.results[x], self.modules[x]) for x in self.results.keys() if l(self.results[x], self.modules[x])]
		else:
			return [return_(x, self.results[x], None) for x in self.results.keys() if l(self.results[x], None)]

class HTML:
	@classmethod
	def cardView(cls, db, name):
		with open("access.log", "a") as log:
			log.write(("Looking for "+name + "\n").encode('utf-8'))
		return json.dumps(db[name])

	noCardError = json.dumps({"error": "No card found with such a name!"})
	noneGivenError = json.dumps({"error": "No card asked!"})

	@classmethod
	def choices(_, l): 
		return json.dumps({"error": "Did you mean one of these? \n - " + "\n - ".join([("<a onclick='namedLoad(this.innerText)'>" + x + "</a>") for x in l])})

if __name__ == "__main__":
	import cgi
	import cgitb; cgitb.enable()

	db = Database(True)

	form = cgi.FieldStorage()
	if "card-value" in form and form["card-value"].value != "":
		print "Content-Type: application/json"
		print ""
		cardName = form["card-value"].value.decode('utf-8')

		if cardName in db.results.keys():
			print HTML.cardView(db, cardName).encode("utf-8")
		else:
			attempt = []
			for x in db.results.keys():
				if x.lower() == cardName.lower():
					attempt = [x]
					break
				elif cardName.lower() in x.lower():
					attempt.append(x)
			if len(attempt) == 1:
				print HTML.cardView(db, attempt[0])
			elif len(attempt) == 0:
				print HTML.noCardError
			else:
				print HTML.choices(attempt)
	elif "filter-value" in form:
		print "Content-Type: application/json"
		print ""

		if form["filter-type"].value == "Batch":
			arr = form["filter-value"].value.split(".")
			results = db.filter(Filters.batch(arr[0], arr[1], arr[1]), Summaries.full)
		else:
			results = db.filter(Filters.module(form["filter-type"].value, form["filter-value"].value), Summaries.full)

		per_round = dict()
		survived = results
		count = len(survived)
		for r in range(1, 14):
			if(count == 0):
				break
			min_vote, max_vote, sum_vote = 100, 0, 0
			for x in survived:
				if str(r) in x["results"]:
					pt = x["results"][str(r)]["Percent"]
					sum_vote += pt
					min_vote = min(min_vote, pt)
					max_vote = max(max_vote, pt)
			avg_vote = sum_vote / float(count)
			survived = [x for x in survived if str(r) in x["results"] and x["results"][str(r)]["Percent"] >= 50]
			new_count = len(survived)
			per_round[r] = [new_count, count - new_count, round(100*float(new_count)/count, 2), round(min_vote, 2), round(avg_vote, 2), round(max_vote, 2)]
			count = new_count

		if "winners-only" in form:
			results = [x for x in results if min([v["Percent"] for (r, v) in x["results"].items()]) >= 50]
		return_ = sample(results, 30) if len(results) > 30 else results

		print json.dumps({"list": return_, "rounds": per_round})
	elif "receive" in form:
		print "Content-Type: text/plain"
		print ""
		Reddit.parseResults(int(form["round"].value), int(form["batch"].value), form["text"].value)
		print Reddit.text("Batch", int(form["round"].value), int(form["batch"].value))
	elif "results_batch" in form:
		print "Content-Type: text/plain"
		print ""
		print Reddit.text("Batch", int(form["round"].value), int(form["batch"].value)).encode('utf-8')
	elif "results_week" in form:
		print "Content-Type: text/plain"
		print ""
		print Reddit.text("Week", int(form["round"].value), int(form["batch"].value)).encode('utf-8')
	elif "top5" in form:
		print "Content-Type: application/json"
		print ""
		print json.dumps(db.rankings[0:5])
	else:
		print "Content-Type: application/json"
		print ""
		print HTML.noneGivenError
