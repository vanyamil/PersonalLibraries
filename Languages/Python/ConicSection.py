from shapely.geometry import Point
from shapely.affinity import rotate, translate
from math import sin, cos, acos, atan2, pi, sqrt, fabs

inf = float('inf')
TAU = 2*pi
EMPTY_POINT = Point(0, 0).boundary.representative_point()

# Clamps the value v between bounds a and b
def clamp(v, a = 0, b = TAU):
	return max(min(v, b), a)

# Returns the magnitude of the vector p
def mag(p):
	return sqrt(p.x**2 * p.y**2)

class Vector(Point):
	@property
	def mag2(self):
		return self.x**2 + self.y**2

	@property
	def mag(self):
		return sqrt(self.mag2)

	@property
	def dir(self):
		return atan2(self.y, self.x)

	def __add__(self, other):
		return Vector(self.x + other.x, self.y + other.y)

	def __neg__(self):
		return Vector(-self.x, -self.y)

	def __sub__(self, other):
		return self + (- other)

	def __mul__(self, other):
		return Vector(self.x * other, self.y * other)

	def __div__(self, other):
		return Vector(self.x / other, self.y / other)

	@property
	def normalized(self):
		return (self / self.mag)

class CircularArc:
	"A circular arc, defined by 5 values"

	# Custom methods
	@classmethod
	def from_circle(cls, center, radius, range_start, range_stop):
		assert radius >= 0, "Negative radii not supported yet!"
		# Zero radius -> center point
		if radius == 0:
			return Point(center)

		# The range of radian angles supporting the arc
		rng = {
			"start" : range_start % TAU,
			"stop" : range_stop % TAU
		}
		# No range -> point on arc
		if(rng["start"] == rng["stop"]):
			return Point(center.x + radius * cos(rng["start"]), center.y + radius * sin(rng["start"]))

		self = CircularArc()

		# Center of the supporting circle
		self._c = Vector(center)
		# Radius of the supporting circle
		self._r = radius
		

		self._rng = rng

		# Length of the range interval
		self._rng["len"] = self._rng["stop"] - self._rng["start"]
		# Half the length (useful for trig)
		self._rng["theta"] = self._rng["len"] / 2.
		# The angle at which the center of the interval is located
		self._rng["tau"] = (self._rng["stop"] + self._rng["start"]) / 2.

		# Deeper trig
		self._apothem = self._r * cos(self._rng["theta"])
		self._sagitta = self._r - self._apothem
		self._half_chord = self._r * sin(self._rng["theta"])

		return self

	@classmethod
	def from_sagitta(_, start, stop, sagitta):
		# Single point
		if(start == stop):
			return Point(start)
		# 0 Sagitta : single Line
		if sagitta == 0:
			return LineString([start, stop])

		self = CircularArc()

		# Setup
		avg = (Vector(start) + Vector(stop)) / 2.
		direction = Vector(stop) - Vector(start)
		self._half_chord = direction.mag / 2.
		# normalize and turn 90 degrees CCW
		direction = Vector(- direction.y, direction.x) / direction.mag
		
		# Now the fancy math
		self._sagitta = sagitta
		self._apothem = self._half_chord**2 / 2 / sagitta - sagitta / 2

		self._c = avg + (direction * r)
		self._r = self._sagitta + self._apothem

		self._rng = {
			"tau" : atan2(-direction.y, -direction.x),
			"theta" : acos(1 - fabs(sagitta)/self._r)
		}

		self._rng["len"] = self._rng["theta"] * 2
		self._rng["start"] = (self._rng["tau"] - self._rng["theta"]) % TAU
		self._rng["stop"] = (self._rng["tau"] + self._rng["theta"]) % TAU

		# todo : handle interval under/overflow by providing an ArcString


	# General attributes
	@property
	def area(self):
		return 0

	@property
	def bounds(self):
		pass

	@property
	def length(self):
		return self._r * self._rng["len"]

	@property
	def geom_type(self):
		return "Curve"

	# Unary predicates

	@property
	def is_empty(self):
		pass

	@property
	def is_ring(self):
		pass

	@property
	def is_simple(self):
		pass

	@property
	def is_valid(self):
		return self._r > 0 and self._rng["len"] > 0

	# General methods

	def distance(self, other):
		pass

	def hausdorff_distance(self, other):
		pass

	def representative_point(self):
		pass

	# Linear referencing

	def interpolate(self, distance, *, normalized = False):
		pass

	def project(self, other, *, normalized = False):
		pass

	# Binary predicates

	def __eq__(self, other):
		pass

	# Set-theoretic

	@property
	def boundary(self):
		pass

	@property
	def centroid(self):
		pass

	@property
	def envelope(self):
		return Polygon(self.bounds)

	@property
	def minimum_rotated_rectangle(self):
		pass