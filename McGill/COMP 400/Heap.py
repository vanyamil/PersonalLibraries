class Heap:
    def __init__(self, cmp_ = lambda x, y: x < y): # If no equals, later entries with same value get placed lower in heap
        self._cmp = cmp_
        self._storage = []
        self._size = 0

    def __len__(self):
        return self.size()

    def size(self):
        return self._size

    def height(self):
        return int(floor(log(self.size()))) + 1

    def push(self, el):
        self._storage.append(el)
        i = self._size
        self._size += 1

        self.__trickleup(i)

    def extend(self, l):
        for el in l:
            self.push(el)

    def top(self):
        return self._storage[0] if self._size > 0 else None

    def pop(self):
        if(self._size == 0):
            return None

        self._size -= 1
        if(self._size == 0): # We only had one element!
            return self._storage.pop()

        root = self._storage[0]
        self._storage[0] = self._storage.pop()
        self.__trickledown(0)
        return root

    def pull(self, n):
        return [self.pop() for _ in range(n)]

    def __swap(self, i, j):
        temp = self._storage[i]
        self._storage[i] = self._storage[j]
        self._storage[j] = temp

    def __trickleup(self, i):
        if i > 0:
            j = (i-1)/2
            if self._cmp(self._storage[i], self._storage[j] ):
                self.__swap(i, j)
                self.__trickleup(j)

    def __trickledown(self, i):
        selected = 2*i+1
        if selected < self._size:
            next = selected + 1
            if(self._size > next and self._cmp(self._storage[next], self._storage[selected])): # This is a case of node with exactly one child
                selected = next
            if self._cmp(self._storage[selected], self._storage[i]): 
                self.__swap(i, selected)
                self.__trickledown(selected)
