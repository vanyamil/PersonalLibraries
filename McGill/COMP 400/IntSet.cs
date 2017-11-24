public class IntervalSet {
	private double low, high;
	private List<Tuple<double, double>> ints;
	private IntervalSet reverse;

	public IntervalSet(double low, double high) {
		this.low = low;
		this.high = high;
		this.ints = new List<Tuple<double, double>>();
		this.reverse = null;
	}

	public int Length => ints.Count;

	public void Add(double low, double high) {
		// Bind values by limits
		low = Math.Max(low, this.low);
		high = Math.Min(high, this.high);
		// If a single point, discard
		if (low == high) return;
		// If a wrapping interval, set up the two halves
		if (high < low) {
			this.Add(low, this.high);
			this.Add(this.low, high);
			return;
		}
		// if Tuple already in interval, no point in storing twice?
		Tuple<double, double> t = new Tuple<double, double>(low, high);
		if (this.ints.Contains(t)) return;
		// Sorted insert
		for(int i = 0; i<this.ints.Count; i++) {
			Tuple<double, double> other = this.ints[i];
			if(other.Item1 > low || (other.Item1 == low && other.Item2 > high)) {
				this.ints.Insert(i, t);
				this.reverse = null;
				return;
			}
		}
		this.ints.Add(t);
		this.reverse = null;
	}

	public void Remove(low, high) {
		if(this.ints.Remove(new Tuple<double, double>(low, high)))
			this.reverse = null;
	}

	public IntervalSet Flatten() {
		IntervalSet ret = new IntervalSet(this.low, this.high);
		// Extract information - equivalent to writing the intervals as a valid set of parenthesis, such as (()(())())()
		List<Tuple<double, bool>> arr = new List<Tuple<double, bool>>(2*this.ints.Count);
		foreach(Tuple<double, double> t in this.ints) {
			arr.Add(new Tuple<double, bool>(t.Item1, false));
			arr.Add(new Tuple<double, bool>(t.Item2, true));
		}
		arr.Sort();
		// Traverse this set to generate flat intervals
		int level = 0;
		double start, end;
		foreach(Tuple<double, bool> t in arr) {
			// Rise up a level
			if(!t.Item2) {
				if(level == 0) {
					start = t.Item1;
				}
				level++;
				continue;
			} else {
				if (--level == 0) {
					end = t.Item1;
					ret.Add(start, end);
				}
			}
		}
		return ret;
	}

	public Random() {
		double r = Math.Random(Length);
		foreach(Tuple<double, double> t in this.Flatten().ints) {
			r -= (t.Item2 - t.Item1);
			if (r <= 0)
				return t.Item2 + r;
		}
		return null;
	}

	public Reverse() {
		if(!this.reverse) {
			IntervalSet ret = new IntervalSet(this.low, this.high);
			double start = this.low;
			foreach(Tuple<double, double> t in Flatten().ints) {
				ret.Add(start, t.Item1);
				start = t.Item2;
			}
			ret.Add(start, this.high);
			this.reverse = ret;
		}
		return this.reverse;
	}

	public R_Length => Reverse().Length
	
	public R_Random() {
		return Reverse().Random();
	} 
}