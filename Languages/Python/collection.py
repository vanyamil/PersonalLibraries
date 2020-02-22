class Collection:
	def __init__(self, items = {}):
		if isinstance(items, Collection):
			self.items = items.all()
		elif isinstance(items, dict):
			self.items = items
		elif isinstance(items, list):
			self.items = dict(zip(range(len(items)), items))
		else:
			self.items = {0: items}

		self._lastkey = self.__lastkey()

	def __lastkey(self):
		if self.count() is 0:
			return 0
		return max(x for x in self.keys() if type(x) is int) + 1

	@staticmethod
	def make(items = {}):
		return Collection(items)

	# All kinds of getters and verifiers

	def all(self):
		return self.items

	def keys(self):
		return list(self.items.keys())

	def values(self):
		return list(self.items.values())

	def has(self, key):
		for x in self.items:
			if x == key:
				return True

		return False

	def contains(self, value):
		for x in self.items:
			if self.items[x] == value:
				return True
		
		return False




	def get(self, key):
		return self.items[key]

	def put(self, key, value):
		self.items[key] = value

		if key == self._lastkey:
			self._lastkey = self.__lastkey()

	def pull(self, key):
		value = self.items[key]
		del self.items[key]

		if key == self._lastkey:
			self._lastkey = self.__lastkey()

		return value

	def push(self, value):
		self.put(self.__lastkey(), value)

	def pop(self):
		return self.pull(self.__lastkey())





	def chunk(self, size):
		if(size <= 0):
			return Collection()
		l = list(self.items.items())
		chunks = [Collection(dict(l[i:i+size])) for i in range(0, self.count(), size)]
		return Collection(chunks)












	def each(self, f):
		for x in self.items:
			if(f(self.items[x], x) is False):
				return



	def every(self, f):
		for x in self.items:
			if(f(self.items[x], x) is False):
				return False

		return True














	# Math functions

	def count(self):
		return len(self.items)

	def sum(self, key = None):
		if(isinstance(key, str)):
			return sum(x[key] for x in self.values())
		elif(key == None):
			return sum(self.values())
		elif(callable(key)):
			return sum(key(x) for x in self.values())
		else:
			return None

	def average(self, key = None):
		return self.avg(key)

	def avg(self, key = None):
		count = self.count()
		if(count > 0):
			return self.sum(key) / count
		return None

	def groupBy(self, groupBy, preserveKeys = False):
		if(type(groupBy) is list):
			future = groupBy[1:]
			groupBy = groupBy[0]
		else:
			future = None

		if(type(groupBy) is string):
			groupBy = lambda value, key : value[groupBy]

		output = Collection()

		for key in self.keys():
			value = self.get(key)
			groups = list(groupBy(value, key))

			for group in groups:
				if not output.has(group):
					output.put(int(group) if type(group) is bool else group, Collection())

				if(preserveKeys):
					output.get(group).put(key, value)
				else:
					output.get(group).push(value)

		if(future is not None):
			return output.map(lambda value, key: value.groupBy(future, preserveKeys))

		return output


	# Filtering the collection
	
	def filter(self, f = None):
		return self.partition(f)[0]

	def reject(self, f = None):
		return self.partition(f)[1]

	def partition(self, f = None):
		if f is None:
			f = lambda item, key : not (not item)

		g = lambda *args, **kwargs: int(f(*args, **kwargs))

		return self.groupBy(g)

	def __keep(self, keeping, *args):
		keeping = bool(keeping)
		fresh = self.all().copy()
		if(len(args) is 1):
			if(isinstance(args[0], list)):
				args = args[0]
			elif(isinstance(args[0], Collection)):
				args = args[0].values()

		for x in fresh:
			if keeping ^ (x in args):
				del fresh[x]

		return Collection(fresh)

	def except_(self, *args):
		return self.__keep(False, *args)

	def only(self, *args):
		return self.__keep(True, *args)