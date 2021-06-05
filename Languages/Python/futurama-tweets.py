# Author - Ivan Miloslavov
# The Futurama frames problem
# AKA generalized coupon collector problem

from random import randint

# Returns the n-th harmonic number
def harmonic(n):
	if n == 1:
		return 1.0
	return harmonic(n-1) + 1.0 / n

# Solution to the coupon collector problem,
# or equivalently, expected tweets for an
# episode of n frames
def singleExpectation(n):
	return n * harmonic(n)

# Practical (you could call it Monte-Carlo method)
# version of counting - just try a random attempt
def countOneEpisode(frames):
	i = 0
	foundCount = 0
	found = [False] * frames

	# While we haven't generated them all
	while foundCount < frames:
		idx = randint(0, frames - 1) # inclusive end
		# If we haven't generated this idx yet
		if not found[idx]:
			found[idx] = True
			foundCount += 1
		i += 1

	return i

# The main Monte-Carlo method function -
# repeat f(args) `times` times and return average
def sumOver(times, f, *args):
	_sum = 0
	for _ in range(times):
		_sum += f(*args)
	return _sum / times

# If you have a list of list lengths, and optionally its precalculated sum,
# this returns a random index pair across them.
# First value is which list, second value is "how far" in that list
def chooseIdx(l, _sum = 0):
	if _sum == 0:
		_sum = sum(l)

	idx = randint(0, _sum - 1)
	i = 0
	for x in l:
		if idx < x:
			return (i, idx)
		i += 1
		idx -= x

	return (-1, -1)

# Given a list of episode lengths (example [4, 6, 5]),
# tries a Monte-Carlo approach to randomly generate
# a possible solution to how many tweets it would take
# to produce all frames of one of these episodes
# Again, combine with sumOver for an average expected number
def countAllEpisodes(l):
	found = [[False] * frames for frames in l]
	rem = [x for x in l]
	_sum = sum(l)
	i = 0

	while 0 not in rem:
		(lidx, idx) = chooseIdx(l, _sum)
		if not found[lidx][idx]:
			found[lidx][idx] = True
			rem[lidx] -= 1
		i += 1

	return i

# Here on out, we will be working with multi-dimensional indexes
# Each index is an N-tuple. We know the smallest value for some i-th
# coordinate is 1, and largest allowed is max[i]

# Generates the next down (or previous) index given one and the max
def nextDown(n, curr, _max):
	idx = n - 1
	result = list(curr)
	while curr[idx] == 1:
		result[idx] = _max[idx]
		idx -= 1
	result[idx] -= 1
	return tuple(result)

# Returns a generator (lazily-evaluated iterable) of
# all possible indexes given the max, starting at one before max
# and ending at (1, 1, ..., 1, 1)
def genAll(l):
	n = len(l)
	curr = nextDown(n, tuple(l), l)
	try:
		while True:
			yield curr
			curr = nextDown(n, curr, l)
	except:
		pass

# The recursive, proper solution to the problem
# Obviously, recursive and therefore limited in application
# Running time is roughly O(prod(l))
def countProperlyAll(l, debug = False):
	mapping = {tuple(l) : 1}
	total = sum(l)
	n = len(l)
	_sum = 1

	for curr in genAll(l):
		# expectedOfCycle = total / sum(curr) # removing to reduce use of total
		sum_over_inc = 0
		prev = list(curr)
		
		for idx in range(n):
			if curr[idx] < l[idx]:
				prev[idx] += 1
				sum_over_inc += mapping[tuple(prev)] * prev[idx] # / total
				prev[idx] -= 1

		temp = sum_over_inc / sum(curr) # * expectedOfCycle
		mapping[curr] = temp
		_sum += temp

	if debug:
		for key, val in mapping.items():
			print(",".join(str(x) for x in key) + " - " + str(val))

	return _sum

# A slightly more optimized version specifically for calculating 2 episodes
def countTwoEpisodes(a, b, debug = False):
	small, big = (a, b) if a < b else (b, a)
	total = small + big

	# Generate first row
	lastRow = [1]

	for rem in range(small - 1, 0, -1):
		here = lastRow[-1] * (rem + 1) / (rem + big)
		lastRow.append(here)
		if debug:
			print(f"{big}, {rem} : {here}")

	_sum = sum(lastRow)
	# Each successive row
	for rem_big in range(big - 1, 0, -1):
		first_entry = lastRow[0] * (rem_big + 1) / (small + rem_big)
		lastRow[0] = first_entry
		_sum += first_entry

		for col in range(1, small):
			rem_small = small - col
			here = (lastRow[col] * (rem_big + 1) + lastRow[col - 1] * (rem_small + 1)) / (rem_small + rem_big)
			lastRow[col] = here
			_sum += here

			if debug:
				print(f"{rem_big}, {rem_small} : {here}")

	return _sum

# Tests ran to estimate values in the post on countProperlyAll:
# for i in range(1, 14): [2**i] * 2 (2 episodes having a power of 2 of frames)
# for i in range(1, 21): [2] * i (i episodes of 2 frames each)
# for i in range(1, 10): [5] * i (i episodes of 5 frames each)
# [2**15]

# My rough estimate as a result of these tests is in the tens of millions of tweets;
# and 10M tweets at 30 minutes apart, as per WolframAlpha, is 570.4 years