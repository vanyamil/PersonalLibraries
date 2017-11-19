class Flag:
    def __init__(self, *keys):
        self.keys = keys
        self.value = 0

    def num(self, name):
        return 1 << self.keys.index(name)
        
    def get(self, name):
        if(name not in self.keys):
            return False
        return (self.value & self.num(name)) != 0
        
    def set(self, name):
        if(name not in self.keys):
            return False
        self.value |= self.num(name)
        return True
    
    def reset(self, name):
        if(self.get(name)):
            self.value ^= self.num(name)
            
    def toggle(self, name):
        if(name not in self.keys):
            return False
        self.value ^= self.num(name)
        return self.get(name)
    
    def force(self, name, v):
        if v:
            self.set(name)
        else:
            self.reset(name)