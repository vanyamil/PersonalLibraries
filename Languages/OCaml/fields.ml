
(* An algebraic field is a set with add/sub/mul/div. Should have
	- associativity of add/mul
	- commutativity of add/mul
	- identity for add/mul
	- inverses for add/mul
	- distributivity of mul over add
 *)
module type AlgFieldSig = sig

	(* Values *)
	type t
	val zero : t
	val one : t

	(* Unary operations *)
	val neg : t -> t
	val succ : t -> t
	val pred : t -> t
	val abs : t -> t
	val inv : t -> t
	
	(* Binary operations *)
	val add : t -> t -> t
	val sub : t -> t -> t
	val mul : t -> t -> t
	val div : t -> t -> t
	(* val rem : t -> t -> t *)

	(* Logical operations - only makes sense for ints
		val logand : t -> t -> t
		val logor : t -> t -> t
		val logxor : t -> t -> t
		val lognot : t -> t
		val shift_left : t -> t -> t
		val shift_right : t -> t -> t
	*)

	(* Comparisons *)
	val equal : t -> t -> bool
	val compare : t -> t -> int
end

module Rationals : sig
	include (AlgFieldSig with type t = (int * int))
	val make : int -> int -> t
end = struct
	type t = int * int

	(* Values *)
	let zero = (0, 1)
	let one = (1, 1)

	(* Some functions we will need *)
	let rec gcd a b = 
		if b <> 0 then gcd b (a mod b)
		else abs a

	let lcm a b = abs (a * b) / gcd a b

	(* Conversions *)

	let reduce (num, den) =
		(* divide both by gcd *)
		let gcd = gcd num den in
		(num / gcd, den / gcd)

	let make num den : t = 
		if den > 0 then reduce (num, den) else
		if den < 0 then reduce (-num, -den) else
		failwith "Infinite rational value"

	let convert_den (num1, den1) (num2, den2) = 
		if den1 = den2 
		then ((num1, den1), (num2, den2))
		else
			let g = gcd den1 den2 in
			let num1' = num1 * den2 / g in
			let m2 = den1 / g in
			let num2' = num2 * m2 in
			let den = den2 * m2 in
			((num1', den), (num2', den))

	(* Unary operations *)

	let neg (num, den) = (-num, den)

	let succ (num, den) = (num + den, den)

	let pred (num, den) = (num - den, den)

	let abs (num, den) = (abs num, abs den)

	let inv (num, den) = make den num

	(* Binary operations *)

	let add a b = 
		let ((an, dn), (bn, _)) = convert_den a b in
		(an + bn, dn)

	let sub a b = neg b |> add a

	let mul (n1, d1) (n2, d2) = reduce (n1 * n2, d1 * d2)

	let div a b = inv b |> mul a

	(* Comparisons *)

	let equal (n1, d1) (n2, d2) = n1 * d2 = n2 * d1

	let compare (n1, d1) (n2, d2) = compare (n1 * d2) (n2 * d1)
end