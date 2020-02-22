try:
    cos
except NameError as e:
    from math import cos

try:
    sin
except NameError as e:
    from math import sin

try:
    sqrt
except NameError as e:
    from math import sqrt

try:
    atan2
except NameError as e:
    from math import atan2

class IGeomTransform(object):
    def rotate(self, theta):
        "Turns the object by `theta` radians the usual, 'CCW' way, around the `center` of the shape"
        return NotImplemented

    def translate(self, v):
        "Translates the object by a vector v"
        return NotImplemented

    def scale(self, a):
        "Scales the object by a in all directions w.r.t the `center` of the shape"
        return NotImplemented

    def rotate_x(self, theta, point):
        "Turns the object by `theta` radians the usual, 'CCW' way, around a point"
        return NotImplemented

    def scale_x(self, a, b, theta):
        "Scales the object by a along theta and b orthogonally to theta, w.r.t the `center` of the shape"
        return NotImplemented

class IGeomObject(object):
    def dist(self, v):
        "Distance between this object and a point"
        return NotImplemented
    
    def closest(self, v):
        "Returns the closest point to given point in object"
        return NotImplemented
    
    def contains(self, v):
        "Tests whether the point is inside the object or on its boundary"
        return NotImplemented
    
    def intersects(self, other):
        "Tests whether this object intersects another object of same type (touching boundary only does not count)"
        return NotImplemented

    def normalize(self):
        "Returns a unit version of the object"
        return NotImplemented

    def center(self):
        "Returns the center of the shape"
        return NotImplemented

class Vector(IGeomObject, IGeomTransform):
    def __init__(self, x, y):
        self.x = float(x)
        self.y = float(y)
        
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __hash__(self):
        return hash((self.x, self.y))

    @classmethod
    def polar(_, mag, dir):
        return Vector(cos(dir), sin(dir)).mult(mag)

    def mag(self):
        return sqrt(self.dot(self))

    def dir(self):
        return atan2(self.y, self.x)

    def copy(self):
        return Vector(self.x, self.y)

    def center(self):
        return Vector(0, 0)
    
    def add(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    
    def inverse(self):
        return Vector(-self.x, -self.y)
    
    def sub(self, other):
        return self.add(other.inverse())
    
    def mult(self, scalar):
        return Vector(scalar*self.x, scalar*self.y)
    
    def dot(self, other):
        return self.x * other.x + self.y * other.y
    
    def dist(self, v):
        return dist(v.x, v.y, self.x, self.y)
    
    def closest(self, v):
        return self.copy()
    
    def contains(self, v):
        return v == self
    
    def intersects(self, other):
        return other == self

    def translate(self, v):
        return self.add(v)

    def scale(self, a):
        return self.mult(a)

    def rotate(self, theta):
        return Vector(self.x*cos(theta) - self.y*sin(theta), self.x*sin(theta) + self.y*cos(theta))

    def normalize(self):
        return self.scale(1/self.mag())

class Circle(IGeomObject, IGeomTransform):
    def __init__(self, x, y, r):
        self.x = x
        self.y = y
        self.r = r
        self.center = Vector(x, y)

    def __eq__(self, other):
        return self.r == other.r and self.center == other.center

    def __hash__(self):
        return hash((self.center, self.r))

    def center(self):
        return self.center.copy()

    def copy(self):
        return Circle(self.x, self.y, self.r)
        
    def dist(self, v):
        return max(0, self.center.dist(v) - self.r)
    
    def closest(self, v):
        if self.contains(v):
            return v.copy()
        else:
            theta = v.sub(self.center).dir()
            return Vector.polar(self.radius, theta)
    
    def contains(self, v):
        return dist(v) == 0

    def intersects(self, other):
        return self.dist(other.center) < (self.r + other.r)

    def rotate(self, theta):
        return self.copy()

    def translate(self, v):
        c_new = self.center.translate(v)
        return Circle(c_new.x, c_new.y, r)

    def scale(self, a):
        return Circle(self.x, self.y, self.r*a)

    def normalize(self):
        return self.scale(1/self.r)
        
class Segment(IGeomObject, IGeomTransform):
    def __init__(self, v1, v2):
        self.start =  v1.copy()
        self.stop = v2.copy()

    def __eq__(self, other):
        return (self.start == other.start and self.stop == other.stop) # or (self.start == other.stop and self.stop == other.start)

    def __hash__(self):
        return hash((self.start, self.stop))
        
    def dist(self, v):
        return self.closest(v).dist(v)
        
    def closest(self, v):
        v1 = v.sub(self.start)
        v2 = self.stop.sub(self.start)
        i = v1.dot(v2)/v2.dot(v2)
        if i < 0:
            return self.start
        elif i > 1:
            return self.stop
        else:
            return self.start.add(v2.mult(i))
    
    def contains(self, v):
        return self.dist(v) == 0

    def center(self):
        return self.start.add(self.stop.sub(self.start).mult(0.5))

    def length(self):
        return self.stop.sub(self.start).mag()
    
class Triangle(IGeomObject, IGeomTransform):
    def __init__(self, a, b, c):
        self.a = a.copy()
        self.b = b.copy()
        self.c = c.copy()

    def area(self):
        "Returns the area by Heron's formula"
        s = (self.a.mag()+self.b.mag()+self.c.mag())/2
        return sqrt(s*(s-a)*(s-b)*(s-c))

    def contains(self, v):  
        # http://blackpawn.com/texts/pointinpoly/
        
        v0 = self.c.sub(self.a)
        v1 = self.b.sub(self.a)
        v2 = self.p.sub(self.a)
        
        dot00 = v0.dot(v0)
        dot01 = v0.dot(v1)
        dot02 = v0.dot(v2)
        dot11 = v1.dot(v1)
        dot12 = v1.dot(v2)
        
        invDenom = 1 / (dot00 * dot11 - dot01 * dot01)
        u = (dot11 * dot02 - dot01 * dot12) * invDenom
        v = (dot00 * dot12 - dot01 * dot02) * invDenom

        return u >= 0 and v >= 0 and u + v <= 1

    def closest(self, v):
        if self.contains(v):
            return v.copy()
        else:
            a, b, c = Segment(self.b, self.c).closest(), Segment(self.c, self.a).closest(), Segment(self.a, self.b).closest()
            la, lb, lc = [x.dist(v) for x in [a, b, c]]
            m = min(la, lb, lc)
            if m == la:
                return a
            elif m == lb:
                return b
            return c

    def dist(self, v):
        return self.closest(v).dist(v)

class Polyline(IGeomObject, IGeomTransform):
    def __init__(self, points, closed = False):
        self.closed = closed
        self.segments = [Segment(points[i], points[i+1]) for i in range(len(points)-1)]
        if closed:
            self.segments.append(Segment(points[len(points)-1], points[0]))

    def dist(self, v):
        return min([s.dist(v) for s in self.segments])

    def translate(self, v):
        return Polyline([x.translate(v) for x in self.points], self.closed)

class Rectangle(IGeomObject, IGeomTransform):
    def __init__(self, x, y, w, h, theta = 0):
        self.center = Vector(x, y)
        self.w = w
        self.h = h
        self.theta = theta
        corners = [Vector(-w, -h), Vector(w, -h), Vector(w, h), Vector(-w, h)]
        corners = [x.scale(0.5).rotate(theta).translate(self.center) for x in corners]
        self.border = Polyline(corners, True)

    def contains(self, v):
        modded = v.rotate(-self.theta).translate(self.center.inverse())
        return abs(modded.x)*2 <= self.w and abs(modded.y)*2 <= self.h

    def dist(self, v):
        if self.contains(v):
            return 0
        return self.border.dist(v)

class Group(IGeomObject, IGeomTransform):
    def __init__(self, *args):
        self.els = [x for x in args if isinstance(x, GeomObject)]

    def dist(self, v):
        return min(map(lambda x: x.dist(v), self.els))

    def closest(self, v):
        l = map(lambda x: x.closest(v), self.els)
        m = map(lambda x: x.dist(v), l)
        i = m.index(min(m))
        return l[i]
    
    def contains(self, v):
        return len(0 for x in self.els if x.contains(v)) > 0

