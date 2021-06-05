module BigInteger : sig
	type t

	val zero : t
	val one : t
	val minus_one : t

	val compare : t -> t -> int
	val equal : t -> t -> bool

	val succ : t -> t
	val pred : t -> t
	val neg : t -> t
	val abs : t -> t

	(* val add : t -> t -> t *)

	(* val bigint_of_int : int -> t *)
	(* val int_of_bigint : t -> int *)
end = struct
	(* Little-endian (ones are first element) list, and list length *)
	type t = {
		sign: int;
		l: int list;
		len: int
	}
	type u_t = int list * int
	let maxVal = 0x7FFF
	let power = 0x8000

	let make_from_u (sgn : int) (l, n : u_t) = 
	{
		sign = sgn;
		l;
		len = n
	}

	(* constants *)
	let u_zero : u_t = ([], 0)
	let zero = make_from_u 0 u_zero

	let u_one : u_t = ([1], 1)
	let one = make_from_u 1 u_one
	let minus_one = make_from_u ~-1 u_one

	(* Unsigned ("safe") ops *)

	let rec u_succ (l, n : u_t) cont = match l with
	| [] -> cont u_one
	| h :: t ->
		if h < maxVal
		then cont ((h + 1) :: t, n)
		else 
		u_succ (t, pred n) (fun (l, n) -> cont (0 :: l, n + 1))

	let rec u_pred (l, n : u_t) cont = match l with
	| [] 
	| [0] -> failwith "Pred of empty/zero"
	| [1] -> cont u_zero
	| 0 :: next :: t -> 
		u_pred (next :: t, n - 1) (fun (l, n) -> cont (maxVal :: l, n + 1))
	| h :: t -> cont ((h - 1) :: t, n)

	let u_add (a : u_t) (b : u_t) : u_t = 
		let local_add a b (l, n, carry) = 
			let s = a + b + carry in
			let (s, carry) = 
				if s >= power
				then (s - power, 1)
				else (s, 0)
			in
			(s :: l, n + 1, carry)
		in
		let rec aux a b (accl, acclen, carry as acc) =
			match a, b with
			| ([], _), x | x, ([], _) -> 
				let (rem, remn) = 
					if carry = 0
					then x
					else u_succ x (fun x -> x)
				in
				List.rev_append accl rem, acclen + remn
			| (a1 :: a', alen), (b1 :: b', blen) ->
				aux (a', alen - 1) (b', blen - 1) (local_add a1 b1 acc)
		in
		aux a b ([], 0, 0) 

	(* Actual visible ops *)

	let compare a b = 
		let sgn = compare a.sign b.sign in
		if sgn <> 0 then sgn else
		let len = compare a.len b.len in
		if len <> 0 then len else
		compare (List.rev a.l) (List.rev b.l)

	let equal a b = 
		if a.sign <> b.sign then false else
		if a.len <> b.len then false else
		let rec aux a b = match a, b with
			| [], [] -> true
			| a :: a', b :: b' -> if a <> b then false else aux a' b'
			| _ -> false
		in
		aux a.l b.l

	let succ x = 
		if x.sign = ~-1
		then u_pred (x.l, x.len) 
			(fun (l, n as x) -> if n = 0 then zero else make_from_u ~-1 x)
		else u_succ (x.l, x.len) (make_from_u 1)

	let pred x = 
		if x.sign = 1
		then u_pred (x.l, x.len) 
			(fun (l, n as x) -> if n = 0 then zero else make_from_u 1 x)
		else u_succ (x.l, x.len) (make_from_u ~-1)

	let neg x = if x.sign = 0 then x else {
		sign = ~- (x.sign);
		l = x.l;
		len = x.len
	}

	let abs x = if x.sign = ~-1 then neg x else x

	(* 
	*)
end ;;