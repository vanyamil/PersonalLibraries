namespace Geometry2D {
	class Vector {
		private double x, y;

		Vector() {
			Vector(0, 0);
		}

		Vector(double x, double y) {
			this.x = x
			this.y = y
		}

		Vector Clone() {
			return new Vector(this.x, this.y);
		}

		bool Equals(Vector other) {
			return this.x == other.x && this.y == other.y;
		}

		Vector Mult(double scalar) {
			return new Vector(this.x * scalar, this.y * scalar);
		}

		Vector Normalize() {
			return this.Mult(1./this.Mag())
		}

		Vector Add(Vector v) {
			return new Vector(this.x + v.x, this.y + v.y);
		}

		Vector Inverse() {
			return this.Mult(-1);
		}

		Vector Sub(Vector v) {
			return this.Add(this.Inverse())
		}

		double Dot(Vector v) {
			return this.x*v.x + this.y*v.y;
		}

		double Mag2() {
			return this.dot(this);
		}

		double Mag() {
			return Math.Sqrt(this.Mag2());
		}

		double Dir() {
			return Math.Atan2(this.y, this.x);
		}

		static Vector Polar(double mag, double dir) {
			return (new Vector(Math.Cos(dir), Math.Sin(dir))).Scale(mag);
		}

		Vector Normalize() {
			return this.Mult(1./this.Mag())
		}

		// IGeomObject

		double Dist(Vector v) {
			return v.Sub(this).Mag();
		}

		// IGeomTransform

		Vector Scale(double k) {
			return this.Mult(k);
		}

		Vector Translate(Vector v) {
			return this.Add(v);
		}

		Vector Rotate(double theta) {
			return new Vector(this.x*Math.Cos(theta) - this.y*Math.Sin(theta), this.x*Math.Sin(theta) + this.y*Math.Cos(theta))
		}
	}

	interface IGeomObject {
		/// Returns the smallest distance between the vector V and any point on/in the object.
		double Dist(Vector v);
		/// Returns a point on the shape that is closest to the vector v
		Vector Closest(Vector v);
		/// Returns true iff v is on the border or inside the shape.
		bool Contains(Vector v);
		// Assume that `other` is of same type and can be casted as it?
		// bool Intersects(GeomObject other);
	}

	interface IGeomTransform {
		IGeomTransform Rotate(double theta);
		IGeomTransform Translate(Vector v);
		IGeomTransform Scale(double k);
	}

	class Circle : IGeomObject {
		private Vector center;
		private double radius;

		Circle() {
			Circle(Vector(), 1);
		}

		Circle(Vector center, double radius) {
			this.center = center;
			this.radius = radius;
		}

		Circle Clone() {
			return new Circle(this.center, this.radius);
		}

		double Dist(Vector v) {
			return Math.Max(0, v.dist(this.center) - this.radius);
		}

		Vector Closest(Vector v) {
			if(this.Dist(v) == 0) return v.Clone();
			else return v.Sub(this.center).Normalize.Scale(this.radius).Add(this.center);
		}

		bool Contains(Vector v) {
			return this.Dist(v) == 0;
		}

		bool Intersects(Circle other) {
			return this.center.Dist(other.center) < (this.radius + other.radius);
		}
	}

	class Segment : IGeomObject {
		private Vector start, segment;

		Segment() {
			Segment(Vector(), Vector(1, 0));
		}

		Segment(Vector start, Vector stop) {
			this.start = start;
			this.segment = stop.Sub(start);
		}

		Segment Clone() {
			return new Segment(this.start, this.start.Add(this.segment));
		}

		Vector Closest(Vector v) {
			Vector v1 = v.Sub(this.start);
			double i = v1.dot(this.segment)/this.segment.mag2();
			i = Math.Max(0, Math.Min(i, 1));
			return this.start.add(this.segment.Mult(i));
		}

		double Dist(Vector v) {
			return this.Closest(v).Dist(v);
		}

		bool Contains(Vector v) {
			return this.Dist(v) == 0;
		}

		Vector Center() {
			return this.start.Add(this.segment.Mult(0.5));
		}

		double Length() {
			return this.segment.Mag();
		}

		Segment translate(Vector v) {
			Segment ret = this.Clone();
			ret.start.Add(v);
			return ret;
		}

		Segment rotate(double theta) {
			Segment.ret = this.Clone();
			ret.start.rotate(theta);
			ret.segment.rotate(theta);
			return ret;
		}
	}

	class Triangle : IGeomObject {
		private Vector a, b, c;

		Triangle(Vector a, Vector b, Vector c) {
			this.a = a.Clone();
			this.b = b.Clone();
			this.c = c.Clone();
		}
	}

	class Polyline : IGeomObject {
		private List<Segment> segments;
	}

	class Rectangle : IGeomObject {
		private List<Vector> corners;
	}

	class Group : IGeomObject {

	}
}