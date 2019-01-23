from utility.collection import Collection
from queue import Queue

class MessagingBus:
	def __init__(self):
		self._systems = Collection()
		self._queue = Queue()
		self.processQueue()

	def send(self, message):
		self._queue.put(message)

	def processQueue(self):
		message = self._queue.get()
		self._systems.each(lambda x : x.notify(message))