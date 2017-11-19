
class IntervalSet:
    def __init__(self, low, high):
        self.l = low
        self.h = high
        self.ints = []
        self._reverse = None
        
    def add(self, low, high):
        low = max(low, self.l)
        high = min(high, self.h)
        if high == low: 
            return
        if high < low :
            self.add(low, self.h)
            self.add(self.l, high)
            return
        t = (low, high)
        if t in self.ints:
            return
        for i in range(len(self.ints)):
            if self.ints[i][0] > t[0] or (self.ints[i][0] == t[0] and self.ints[i][1] > t[1]):
                self.ints.insert(i, t)
                self._reverse = None
                return
        self.ints.append(t)
        self._reverse = None

    def flatten(self):
        ret = IntervalSet(self.l, self.h)

        # Boolean represents {closing?} 
        l = [(i, False) for (i, _) in self.ints] + [(i, True) for (_, i) in self.ints]
        l.sort()

        level = 0
        start = None
        end = None
        for (v, closing) in l:
            if(not closing):
                if level == 0:
                    start = v
                level += 1
                continue
            else:
                level -= 1
                if level == 0:
                    end = v
                    ret.add(start, end)

        return ret

    def length(self):
        return sum([(high-low) for (low, high) in self.flatten().ints])

    def remove(self, low, high):
        t = (low, high)
        if t in self.ints:
            self.ints.remove(t)
            self._reverse = None

    def rnd(self):
        r = random(self.length())
        for (low, high) in self.flatten().ints:
            r -= (high - low)
            if r <= 0:
                return high + r
        return None

    def reverse(self):
        if self._reverse == None:
            j = self.flatten()
            ret = IntervalSet(self.l, self.h)
            start = self.l
            for (low, high) in j.ints:
                ret.add(start, low)
                start = high
            ret.add(start, self.h)

            self._reverse = ret

        return self._reverse

    def rev_length(self):
        return self.reverse().length()

    def rev_rnd(self):
        return self.reverse().rnd()