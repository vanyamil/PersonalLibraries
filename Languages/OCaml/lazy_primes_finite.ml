(* Generic, potentially infinite lazy stream *)
type 'a stream = unit -> 'a node option 
 and 'a node = { hd : 'a; tl: 'a stream } ;;

(* Empty stream; if a tail is this, the stream is finite and done *)
let empty : 'a stream = fun _ -> None ;;

(* A single element stream *)
let return (x: 'a) : 'a stream = fun _ -> Some ({ hd = x; tl = empty}) ;;

(* Repeat an operation for each element of a stream *)
let rec iter (f: 'a -> unit) s = 
	match s () with
	| None -> ()
	| Some { hd; tl } -> f hd; iter f tl
;;

(* Take first n from a stream *)
let take n s = 
	let rec aux n s acc = 
		if n < 1 then List.rev acc
		else match s () with
		| None -> List.rev acc
		| Some { hd; tl } -> aux (pred n) tl (hd :: acc)
	in
	aux n s []
;;

(* Skip, complementary to take *)
let rec skip n s = 
	if n < 1 then s
	else match s () with
	| None -> empty
	| Some { hd; tl } -> skip (pred n) tl
;;

(* A filtered stream - skips elements not passing a test *)
let rec filter f s =
	match s () with
	| None -> empty
	| Some { hd; tl } -> 
		if f hd 
		then fun _ -> Some { hd; tl = filter f tl }
		else filter f tl
;;

(* Consecutive integer stream *)
let rec arith by n () = Some {hd = n; tl = arith by (n + by)} ;;
let naturals = arith 1 1 ;;

(* Filter out the multiples of p from an integer stream *)
let no_mults ps s = filter (fun n -> List.for_all (fun p -> n mod p <> 0) ps) s ;;

(* The sieve of Erasthothenes as an infinite stream *)
let rec sieve ps s () = 
	let Some { hd; tl } = s () in 
	Some ({ 
		hd; 
		tl = (sieve (ps @ [hd]) (no_mults ps tl)) 
	})
;;

let primes = sieve [2] (arith 2 3) ;;

(* Using Seq module *)

let rec arith by n () = Seq.Cons (n, arith by (n + by)) ;;
let naturals = arith 1 0 ;;
let first_10 = Seq.take 10 naturals ;;

let no_mults ps s = Seq.filter (fun n -> List.for_all (fun p -> n mod p <> 0) ps) s ;;

let rec sieve ps s () =
	let Seq.Cons (n, t) = s () in
	let new_no_mults = no_mults ps t in
	let t' = sieve (ps @ [n]) new_no_mults in
	Seq.Cons (n, t')
;;

let primes = sieve [2] (arith 2 3) ;;