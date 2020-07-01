(* Generic infinite lazy stream *)
type 'a stream = { hd : 'a; tl : unit -> 'a stream; } ;;
(* Next element of stream as a new stream  *)
let next (s : 'a stream) = s.tl () ;;
(* Consecutive integer stream *)
let rec arith by n = {hd = n; tl = fun () -> arith by (n + by)} ;;
let naturals = arith 1 1 ;;
(* Take first n from a stream *)
let rec take n s = if n < 1 then [] else s.hd :: take (n - 1) (next s) ;;
(* Take, but tail-recursive *)
let take n s = 
	let rec aux acc n s = 
		if n < 1 
		then List.rev acc
		else aux (s.hd :: acc) (n-1) (next s)
	in aux [] n s
;;
(* Skip, complementary to take *)
let rec skip n s = if n <= 0 then s else skip (pred n) (next s)
(* A filtered stream - skips elements not passing a test *)
let rec filter f s = if (f s.hd) then { hd = s.hd; tl = fun () -> filter f (next s) } else filter f (next s) ;;
(* Map a stream with a function *)
let rec map f s = { hd = f s.hd; tl = fun () -> map f (next s) } ;;

(* Filter out the multiples of p from an integer stream *)
let no_mults ps s = filter (fun n -> List.for_all (fun p -> n mod p <> 0) ps) s ;;
(* The sieve of Erasthothenes as an infinite stream *)
let rec sieve ps s = ({ hd = s.hd; tl = fun () -> sieve (ps @ [s.hd]) (no_mults ps (next s)) }) ;;

let primes = {hd = 2; tl = fun () -> sieve [2] (arith 2 3) } ;;

let penta n = n * (3 * n - 1) / 2 ;;
let pentaStr = map penta naturals ;;
let invPenta n = 
  let sq = float (1 + 24 * n) in
  let rem, sqrtv = modf ((1. +. sqrt sq) /. 6.) in
  if rem = 0. then int_of_float sqrtv else -1 ;;