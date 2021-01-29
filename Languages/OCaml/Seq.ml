module Seq : sig
	type 'a t = unit -> 'a node
	and 'a node = Nil | Cons of 'a * 'a t

	(* Construction methods *)
	val empty : 'a t
	val return : 'a -> 'a t
	val cons : 'a -> 'a t -> 'a t

	(* Transform methods *)
	val append : 'a t -> 'a t -> 'a t
	val map : ('a -> 'b) -> 'a t -> 'b t
	val filter : ('a -> bool) -> 'a t -> 'a t
	val filter_map : ('a -> 'b option) -> 'a t -> 'b t
	val flat_map : ('a -> 'b t) -> 'a t -> 'b t

	(* Other stuff *)
	val fold_left : ('a -> 'b -> 'a) -> 'a -> 'b t -> 'a
	val iter : ('a -> unit) -> 'a t -> unit
	val unfold : ('b -> ('a * 'b) option) -> 'b -> 'a t

	(* Custom additions *)
	val fold_left_finite : ('a -> 'b -> 'a option) -> 'a -> 'b t -> 'a
	val take : int -> 'a t -> 'a list
end
= struct
	type 'a t = unit -> 'a node
	and 'a node = Nil | Cons of 'a * 'a t

	(* Construction methods *)

	let empty () = Nil
	let cons x tail () = Cons (x, tail)
	let return x = cons x empty

	(* Transform methods *)

	let rec append s1 s2 () = match s1 () with
		| Nil -> s2 ()
		| Cons (el, t) -> Cons (el, append t s2)

	let rec flat_map f s () = match s () with
		| Nil -> Nil
		| Cons (el, t) -> 
			let new_seq = f el in
			append new_seq (flat_map f t) ()

	let rec filter_map f s () = match s () with
		| Nil -> Nil
		| Cons (el, t) -> 
			let tail = filter_map f t in
			match f el with
			| None -> tail ()
			| Some v -> Cons (v, tail)

	let rec map f s () = match s () with
		| Nil -> Nil
		| Cons (el, t) -> Cons (f el, map f t)

	let map f = filter_map (fun x -> Some (f x))

	let rec filter p s () = match s () with
		| Nil -> Nil
		| Cons (el, t) -> 
			let tail = filter p t in
			if p el 
			then Cons (el, tail)
			else tail ()

	let filter p = filter_map (fun x -> if p x then Some x else None)

	(* Other stuff *)

	let rec fold_left comb acc s = match s () with
		| Nil -> acc
		| Cons (el, t) -> 
			let acc' = comb acc el in
			fold_left comb acc' t

	let rec iter f s = match s () with
		| Nil -> ()
		| Cons (el, t) -> f el; iter f t

	let rec unfold f x () = match f x with
		| None -> Nil
		| Some (el, x') -> Cons (el, unfold f x')

	(* Custom additions *)

	let rec fold_left_finite comb acc s = match s () with
		| Nil -> acc
		| Cons (el, t) -> match comb acc el with
			| None -> acc
			| Some acc' -> fold_left_finite comb acc' t

	let take n s = 
		let rec aux n s acc = 
			if n = 0 then List.rev acc
			else match s () with
			| Nil -> List.rev acc
			| Cons (el, t) -> aux (n - 1) t (el :: acc)
		in
		if n < 0 then failwith "Can't take negative number of elements"
		else aux n s []
end