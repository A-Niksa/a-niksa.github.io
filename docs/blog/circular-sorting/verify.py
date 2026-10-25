"""Independent verifier; Python 3 standard library only. Run: python3 verify.py"""
import json
from pathlib import Path


def decompose(p, k):
    n = len(p)
    remaining = set(range(n))
    result = []
    while remaining:
        start = min(remaining)
        i = start
        cycle = []
        while i in remaining:
            remaining.remove(i)
            cycle.append(i)
            i = (p[i] + k) % n
        assert i == start
        result.append(cycle)
    return result


def verify():
    data = json.loads(Path(__file__).with_name("witnesses.json").read_text())
    for size, record in data.items():
        n = int(size)
        p = record["permutation"]
        assert len(p) == n and sorted(p) == list(range(n))
        computed = [decompose(p, k) for k in range(n)]
        assert computed == record["decompositions"]
        counts = [len(c) for c in computed]
        assert counts == record["cycle_counts"]
        assert max(counts) == 4
        assert n - max(counts) == record["witness_distance"] == n - 4
        for k, cycles in enumerate(computed):
            assert sorted(v for cycle in cycles for v in cycle) == list(range(n))
            for cycle in cycles:
                assert cycle
                assert all((p[a] + k) % n == b
                           for a, b in zip(cycle, cycle[1:] + cycle[:1]))
        print(f"n={n}: permutation valid; all {n} decompositions valid; "
              f"maximum cycles=4; witness distance={n-4}")
        print("  cycle counts:", counts)


if __name__ == "__main__":
    verify()
