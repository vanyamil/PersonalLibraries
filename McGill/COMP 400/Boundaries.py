import Geometry2D as g2

def vector_boundary(v, d):
	return g2.Circle(v.x, v.y, d)

def circle_boundary(c, d):
	return c.normalize().scale(d)

def segment_boundary(s, d):
	start_c = g2.Circle(s.start.x, s.start.y, d)
	stop_c = g2.Circle(s.stop.x, s.stop.y, d)
	seg_b = g2.Rectangle(s.center().x, s.center().y, s.length(), 2*d, s.stop.sub(s.start).dir())
	return g2.Group(start_c, stop_c, seg_b)

def polyline_boundary(p, d):
	l = set()
	for s in p.segments:
		l |= set(segment_boundary(s, d).els)
	return g2.Group(*list(l))

def rect_boundary(r, d):
	return polyline_boundary(r.border, d)

def tri_boundary(t, d):
	p = g2.Polyline([t.a, t.b, t.c], True)
	return polyline_boundary(p, d)