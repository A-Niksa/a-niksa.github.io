# Improved lower bounds for circular sorting

Date: 25 October 2026.

## Result and novelty scope

For oriented circular arrangements of n distinct labels, rotations identified
and reflections distinct, allow a swap of any two labels. Let x(n) be the
diameter in this metric. The explicit witnesses in this package establish:

| n | Bounds in arXiv:2510.18529v3, Table 1 | Bounds established here |
|---|---|---|
| 36 | 31 <= x(36) <= 33 | **32 <= x(36) <= 33** |
| 40 | 35 <= x(40) <= 37 | **36 <= x(40) <= 37** |
| 42 | 37 <= x(42) <= 39 | **38 <= x(42) <= 39** |

The improvements are to the lower bounds. The upper bounds are known and an
elementary proof for all even n >= 4 is supplied below. These results do not
determine the three diameters exactly and do not settle the general case.

Baseline: Paul Bastide, Anurag Bishnoi, Carla Groenland, Dion Gijswijt,
Rohinee Joshi, *Circular sorting, strong complete mappings and wreath product
constructions*, arXiv:2510.18529v3, Table 1 and Theorem 3.
https://arxiv.org/html/2510.18529v3

The original cycle-count reformulation is also in Ron M. Adin, Noga Alon,
Yuval Roichman, *Circular Sorting*, Section 3.
https://arxiv.org/abs/2502.14398

Searches of the subsequent literature did not find these improved bounds.
The precise substantiated novelty claim is an improvement over the cited
table, not a guarantee that nobody has independently found these witnesses
or stronger bounds elsewhere.

## Proof of the lower bounds

Represent a permutation p by the list [p(0),...,p(n-1)]. Let r(i)=i+1 mod n.
Write C(q) for the number of cycles of a permutation q, including fixed points.

**Transposition-length lemma.** The minimum number of arbitrary transpositions
needed to sort q into the identity is n-C(q).

Proof: multiplication by a transposition either merges two cycles or splits
one cycle into two. Therefore each swap increases C by at most one; the
identity has n cycles, so at least n-C(q) swaps are necessary. Conversely,
a cycle of length l can be sorted with l-1 swaps. Summing this over the
disjoint cycles gives exactly n-C(q). QED.

The distance from the circular arrangement [p] to the sorted circle is

    d([p],[id]) = min_(0 <= k < n) (n-C(r^k p))
                = n - max_(0 <= k < n) C(r^k p).

Indeed, sorting up to rotation means sorting to some r^k. Transposition
length is invariant under inversion and conjugation, so the equivalent
left/right placement and sign of the rotation give the same minimum.
Equivalently, rotations between swaps can be moved to the end, since a
rotation conjugates a transposition to another permitted transposition.

For each witness in witnesses.json, p is a permutation of 0,...,n-1, and
for every k the supplied certificate is a partition of all n labels into
nonempty cycles. Every consecutive arrow a -> b, including each closing
arrow, satisfies b=(p(a)+k) mod n. These are consequently the exact disjoint
cycles of r^k p. Every certificate has at most four cycles, and at least
one has exactly four. Thus the corresponding arrangement has distance
exactly n-4 from the sorted circle. The diameter is at least this distance,
giving the three asserted lower bounds. QED.

### A compact witness for n=36

    p = [17,32,8,24,5,20,14,15,13,19,29,2,25,10,12,6,22,7,
         30,11,16,23,1,28,31,3,21,0,27,33,26,4,35,18,9,34]

Its complete cycle-count profile has the simple description:

* C(r^k p)=1 when k=0.
* C(r^k p)=2 when k=7 or k=23.
* C(r^k p)=3 when k is nonzero and even.
* C(r^k p)=4 for all remaining (odd) k.

The profiles and all individual cycles for n=40 and n=42 are included in
witnesses.json and CircularSorting.lean as well.

## Proof of the upper bounds for even n >= 4

Every circular arrangement has a rotation with a fixed point, and hence
at least two cycles. Thus x(n) <= n-2.

Suppose an arrangement required n-2 swaps. Then all n rotated permutations
would have at most two cycles. For n>=3 none of them can have two fixed
points: the remaining n-2 labels would contribute at least one further
cycle. Across the n rotations, each label is a fixed point exactly once.
There are therefore n fixed-point incidences in total, and each rotation
must have exactly one fixed point. Its remaining n-1 labels form one cycle.
All rotations consequently have exactly two cycles and the same sign,
(-1)^(n-2).

But for even n the rotation r is odd, so r^k p and r^(k+1) p have opposite
signs. This contradiction excludes distance n-2. The integer distance is
therefore at most n-3. QED.

## What Lean verifies, precisely

CircularSorting.lean is self-contained apart from Lean's bundled Std library.
It was successfully checked with Lean 4.19.0.

For each of n=36,40,42 it proves, by kernel reduction:

1. The witness list has length n and contains each label 0,...,n-1 once.
2. For **every** shift k : Fin n, the listed cycles cover the labels exactly
   once, are nonempty, have correct consecutive/closing arrows, and number
   at most four.
3. The full profile of certificate cycle counts equals the stated list.
4. A specified valid shift attains four cycles.
5. The minimum of n minus these cycle counts is respectively 32,36,38.

All 15 printed theorem axiom reports say `does not depend on any axioms`.
There are no `sorry` proofs, new axioms, native_decide calls, or external
decision oracles. The verifier checks explicit certificates; it does not
trust the search that produced them.

**Formalization boundary:** the general transposition-length lemma, the
interpretation of the checked cycles, the definition of the quotient graph
diameter, and the even-n upper-bound proof are supplied as ordinary
mathematical proofs above. They are not formalized in this file. Therefore
this package is a kernel-checked finite certificate plus a mathematical
reduction, not an end-to-end Lean formalization of the diameter theorem.

## Reproduce the checks

With Lean 4.19.0 installed:

    lean CircularSorting.lean
    python3 verify.py

Lean requires no mathlib or downloaded package dependencies. The Python
verifier uses only the standard library and independently recomputes the
cycles by traversing orbits with a set of unvisited labels. The logs from
both successful checks are included.

The execution sandbox used for this work needed an executable-path
compatibility shim that maps `/proc/<own-pid>/exe` to `/proc/self/exe`.
It changes only executable location lookup, not Lean's kernel or proof
evaluation. Its source is included as runtime_path_compat.c for transparency;
ordinary installations should not need it.

## Discovery and unsuccessful searches

search.cpp is a stochastic search, not an exhaustive proof. It minimizes
the sum over shifts of max(0,C(r^k p)-target)^2 by simulated annealing,
using swaps and 3-cycle mutations. The successful runs used target=4.

    g++ -O3 -std=c++17 search.cpp -o search
    ./search 36 180 36 4
    ./search 40 180 40 4
    ./search 42 180 42 4

Arguments: n, time budget in seconds, RNG seed, cycle target, optional seed
permutation text file. Exact time needed depends on hardware. Search logs
record the witnesses and iteration counts. C++ standard-library shuffle
details can affect reproducibility across implementations; the saved
certificates are sufficient for verification on any platform.

The attempts to prove x(22)=19 and x(24)=21 did not find witnesses. Subsequent
local searches examined approximately 110 million and 93 million proposals,
respectively, and remained one violating rotation away from the target.
These failures supply no upper bound and no evidence of impossibility.

The successful witnesses for 36,40,42 are final and independent of these
unsuccessful attempts. The general formula remains unresolved.
