# An analysis of the D&D 5e Running a Business rules
# Author: Ivan Miloslavov
# See: https://cyberiam.ca/blog/dnd-business-1

from random import randint
from math import ceil

def rollDice(sides, num = 1):
	'''
	Roll a standard, uniform die (or multiple)
	'''
	_sum = 0
	for _ in range(num):
		_sum += randint(1, sides)
	return _sum

def rollForWorkTable(days, debt_penalty = 0):
	'''
	Roll the DMG p.129 die: 1d100 + days - debts
	'''
	return max(rollDice(100) + days - debt_penalty, 1)

def netChangeWorkTable(days, maintenance, debt_penalty = 0):
	'''
	Return net change in money based on days spent, 
	business maintenance cost per day, and debts.
	'''
	roll = rollForWorkTable(days, debt_penalty)
	if roll <= 20:
		return -1.5 * maintenance * days
	if roll <= 30:
		return - maintenance * days
	if roll <= 40:
		return -.5 * maintenance * days
	if roll <= 60:
		return 0
	if roll <= 80:
		return 5 * rollDice(6)
	if roll <= 90:
		return 5 * rollDice(8, 2)
	# Final output
	return 5 * rollDice(10, 3)

def longTermChange(total_days, interval_days, maintenance, start_money = 0):
	'''
	Calculate "average" income based on long interval of time and a set interval
	after each of which change is calculated. Debts are assumed to be required to
	be paid off fully. Based on vanilla DMG rules.
	'''
	_sum = start_money
	debts = 0
	debt_sum = 0
	# We will have to do this this many times
	for _ in range(ceil(total_days / interval_days)):
		# Check the change
		change = netChangeWorkTable(interval_days, maintenance, debts * 10)
		# If we lose money, do we get in debt?
		if _sum + change < 0:
			debts += 1
			debt_sum += change # thus, debt_sum is negative
			continue
		# Change our money
		_sum += change
		# If we gained money, can we pay off debts?
		if debts > 0 and _sum + debt_sum >= 0:
			_sum += debt_sum
			debts = 0
			debt_sum = 0
	# Return total
	return _sum + debt_sum

def longTermAverage(num_tests, f):
	'''
	Calculates actual average income based on a number
	of "longTermChange" tests
	'''
	_sum = 0
	_max = -10000000
	_min = 10000000
	for i in range(num_tests):
		result = f()
		_sum += result
		_max = max(_max, result)
		_min = min(_min, result)
		# print(f"Test {i}: {result}")
	avg = _sum / num_tests
	print(f"Minimum: {_min}; Average: {avg}; Maximum: {_max}")

def wddh_longTermChange(total_days, start_money = 0, advertising = 0):
	'''
	The adventure "Waterdeep: Dragon Heist" introduces slight changes to
	the rules, and this function runs a longTermChange on those rules.
	'''
	# WDDH just reduces by 1 for each unpaid gp, so just track sum alone
	_sum = start_money
	# WD:DH fixed values
	interval_days = 10
	maintenance = 6
	# We will have to do this this many times
	for _ in range(ceil(total_days / interval_days)):
		if _sum < 0:
			# We're in debt, send it as debt to table
			change = netChangeWorkTable(interval_days, maintenance, -_sum)
			_sum += change
		else:
			# We will spend AMAP on advertising
			spend = min(advertising, _sum)
			change = netChangeWorkTable(interval_days, maintenance, -spend)
			_sum += change - spend
	# Return total
	return _sum

def paradoxical_ncwt(days, maintenance, debt_penalty = 0):
	'''
	Modifications by the "Paradoxical Business" blog
	Return net change in money based on days spent, 
	business maintenance cost per day, and debts.
	'''
	roll = rollForWorkTable(days, debt_penalty)
	if roll <= 20:
		return -1.5 * maintenance * days
	if roll <= 30:
		return - maintenance * days
	if roll <= 40:
		return -.5 * maintenance * days
	if roll <= 60:
		return 0
	if roll <= 80:
		return maintenance * days
	if roll <= 90:
		return 2 * maintenance * days
	# Final output
	return 3 * maintenance * days	

def paradoxical_ltc(total_days, maintenance, start_money = 0):
	'''
	Calculate "average" income based on long interval of time and a set interval
	after each of which change is calculated. Debts are assumed to be required to
	be paid off fully. Based on vanilla DMG rules.
	'''
	_sum = start_money
	debts = 0
	debt_sum = 0
	interval_days = 10
	# We will have to do this this many times
	for _ in range(ceil(total_days / interval_days)):
		# Check the change
		change = paradoxical_ncwt(interval_days, maintenance, debts * 10)
		# If we lose money, do we get in debt?
		if _sum + change < 0:
			debts += 1
			debt_sum += change # thus, debt_sum is negative
			continue
		# Change our money
		_sum += change
		# If we gained money, can we pay off debts?
		if debts > 0 and _sum + debt_sum >= 0:
			_sum += debt_sum
			debts = 0
			debt_sum = 0
	# Return total
	return _sum + debt_sum

def wddh_and_paradoxical_ltc(total_days, start_money = 0, advertising = 0, debug = False):
	'''
	The adventure "Waterdeep: Dragon Heist" introduces slight changes to
	the rules, and this function runs a longTermChange on those rules.
	'''
	# WDDH just reduces by 1 for each unpaid gp, so just track sum alone
	_sum = start_money
	# WD:DH fixed values
	interval_days = 10
	maintenance = 6
	# We will have to do this this many times
	for _ in range(ceil(total_days / interval_days)):
		if _sum < 0:
			# We're in debt, send it as debt to table
			change = paradoxical_ncwt(interval_days, maintenance, -_sum)
			_sum += change
			if debug:
				print(f'Was in debt')
		else:
			# We will spend AMAP on advertising
			spend = min(advertising, _sum)
			change = paradoxical_ncwt(interval_days, maintenance, -spend) - spend
			_sum += change
			if debug:
				print(f'Spent {spend} on advertising')

		if debug:
			print(f'Net change: {change}, new balance: {_sum}')
	# Return total
	return _sum

for x in range(0, 2000):
#	print(f'Test {x}')
	print(wddh_and_paradoxical_ltc(360, 1000, 0))
#	longTermAverage(50000, lambda: wddh_and_paradoxical_ltc(360, 1000, 0))
