#!/usr/bin/env python
# -*- coding: utf-8 -*-

from res.py.MLP import NeuralNet as net
import numpy as np
import res.py.mtgb as m

types = [
	"Artifact",
	"Basic",
	"Creature",
	"Enchantment",
	"Instant",
	"Land",
	"Legendary",
	"Planeswalker",
	"Snow",
	"Sorcery",
	"Tribal",
	"World"
]
reverseColorCombos = {
	"Colorless":(0,0,0,0,0),
	"Green":	(0,0,0,0,1),
	"Red":		(0,0,0,1,0),
	"Gruul":	(0,0,0,1,1),
	"Black":	(0,0,1,0,0),
	"Golgari":	(0,0,1,0,1),
	"Rakdos":	(0,0,1,1,0),
	"Jund":		(0,0,1,1,1),
	"Blue":		(0,1,0,0,0),
	"Simic":	(0,1,0,0,1),
	"Izzet":	(0,1,0,1,0),
	"Temur":	(0,1,0,1,1),
	"Dimir":	(0,1,1,0,0),
	"Sultai":	(0,1,1,0,1),
	"Grixis":	(0,1,1,1,0),
	"Yidris":	(0,1,1,1,1),
	"White":	(1,0,0,0,0),
	"Selesnya":	(1,0,0,0,1),
	"Boros":	(1,0,0,1,0),
	"Naya":		(1,0,0,1,1),
	"Orzhov":	(1,0,1,0,0),
	"Abzan":	(1,0,1,0,1),
	"Mardu":	(1,0,1,1,0),
	"Saskia":	(1,0,1,1,1),
	"Azorius":	(1,1,0,0,0),
	"Bant":		(1,1,0,0,1),
	"Jeskai":	(1,1,0,1,0),
	"Tiro":		(1,1,0,1,1),
	"Esper":	(1,1,1,0,0),
	"Atraxa":	(1,1,1,0,1),
	"Breya":	(1,1,1,1,0),
	"Rainbow":	(1,1,1,1,1)
}
setset = [u'ATH', u'CPK', u'EXO', u'pGTW', u'MRD', u'DRK', u'BOK', u'EXP', u'DKA', u'pWOR', u'pWOS', u'DRB', u'pLGM', u'MD1', u'JOU', u'pMGD', u'pPRE', u'WTH', u'STH', u'pPRO', u'8ED', u'pREL', u'pMPR', u'MED', u'pCMP', u'CHK', u'THS', u'ALL', u'pELP', u'CHR', u'TPR', u'GPT', u'BFZ', u'BNG', u'RQS', u'CM1', u'DGM', u'pMEI', u'NPH', u'W16', u'VIS', u'APC', u'DTK', u'FUT', u'PCY', u'EMA', u'pWPN', u'ZEN', u'CMD', u'TSB', u'EVE', u'EVG', u'V10', u'3ED', u'VMA', u'TSP', u'CED', u'PTK', u'JUD', u'UGL', u'DD2', u'SCG', u'ROE', u'CEI', u'10E', u'HML', u'RTR', u'M15', u'ISD', u'DDQ', u'MIR', u'CSP', u'p15A', u'DD3_GVL', u'DDR', u'DST', u'DDP', u'DDK', u'DDJ', u'DDI', u'DDH', u'DDO', u'DDN', u'DDM', u'DDL', u'DDC', u'CST', u'DDG', u'DDF', u'DDE', u'DDD', u'DD3_EVG', u'DD3_DVD', u'PC2', u'MOR', u'INV', u'pFNM', u'AVR', u'BTD', u'MPS', u'LRW', u'WWK', u'TMP', u'ORI', u'H09', u'MM3', u'MM2', u'ATQ', u'ME4', u'AER', u'ME3', u'ME2', u'SOM', u'CON', u'ODY', u'pALP', u'PD3', u'PD2', u'SHM', u'5ED', u'S99', u'V09', u'GTC', u'FRF', u'MGB', u'pLPA', u'FEM', u'9ED', u'pDRC', u'UNH', u'pJGP', u'5DN', u'LEA', u'LEB', u'pGPX', u'PLS', u'NMS', u'LEG', u'S00', u'MMQ', u'ALA', u'M11', u'M10', u'M13', u'M12', u'PLC', u'M14', u'RAV', u'MMA', u'BRB', u'ITP', u'USG', u'pSUS', u'TOR', u'4ED', u'pGRU', u'DPA', u'C13', u'C16', u'C15', u'C14', u'pWCQ', u'PCA', u'CN2', u'SOI', u'SOK', u'POR', u'7ED', u'pSUM', u'6ED', u'EMN', u'ONS', u'DIS', u'MBS', u'KLD', u'pHHO', u'V11', u'CNS', u'PO2', u'ICE', u'HOP', u'KTK', u'ULG', u'DKM', u'UDS', u'LGN', u'V12', u'V13', u'OGW', u'pARL', u'V16', u'pPOD', u'V14', u'V15', u'FRF_UGIN', u'ARB', u'ARC', u'ARN', u'DD3_JVC', u'2ED']

def createNet():
	#234 per card = 468 inputs
	n=net((468,))
	n.addLayer("MLP", 20, "relu")
	n.addLayer("MLP", 1)
	return n

def cardToVector(c):
	result = [0 for x in range(234)]
	#Colors
	result[0:5] = reverseColorCombos[c["CLR"]]
	#CMC: -1 to 11+ -> 5:18
	result[6+min(int(c["CMC"]), 11)] = 1
	#Types: 18:30
	for word in c["TYP"].split(" "):
		if word in types:
			result[18+types.index(word)] = 1
		else: 
			if word is "Scariest" or word is "Eaturecray":
				result[18+types.index("Creature")] = 1
				break
			else:
				if word is "Enchant":
					result[18+types.index("Enchantment")] = 1
					break
	#Sets: 30:230
	for word in c["SET"]:
		if word in setset:
			result[30+setset.index(word)] = 1
	return list(map(lambda x: 0 if x is 0 else 1, result))


def loadValues(db):
	result = {
		"inputs":[], 
		"outputs":[],
		"labels":[]
	}

	for name in db.results:
		for batch in db.results[name]:
			opponent = db.results[name][batch]["Opponent"]
			if opponent == "Bye":
				continue
			result["inputs"].append(cardToVector(db.modules[name]) + cardToVector(db.modules[opponent]))
			result["labels"].append(name + " vs " + opponent)
			result["outputs"].append([db.results[name][batch]["Percent"]/100])

	return {
		"inputs":np.array(result["inputs"]),
		"outputs":np.array(result["outputs"]),
		"labels":np.array(result["labels"])
	}

def run():
	db = m.Database(True)

	n = createNet()
	array = loadValues(db)
	print(array["inputs"].shape, array["outputs"].shape)
	print(n.setInputs(array["inputs"]))
	n.setDesired(array["outputs"])
	n.addLabels(array["labels"])

	#n.prepare(False)
	return n

def matchup(net, card1, card2):
	db = m.Database(True)
	if card1 not in db.results or card2 not in db.results:
		return "Cannot compare these cards, not found!"
	attempt = cardToVector(db.modules[card1]) + cardToVector(db.modules[card2])
	print(net.inLayer.calculate(np.array(attempt)))
	attempt = cardToVector(db.modules[card2]) + cardToVector(db.modules[card1])
	print(net.inLayer.calculate(np.array(attempt)))