r"""Champion-challenger gate CLI.

Usage:
    uv run python -m finsynapse.eval.gate \
        --champion eval/champion.json \
        --challenger /tmp/latest.json

Exit codes:
    0  all rules pass
    1  at least one block rule fails or a champion pivot is missing
    2  only warn rules fail
    3  usage error
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from finsynapse.eval.champion import diff


def _pivot_key(pivot: dict[str, Any]) -> tuple[str, str, str, str]:
    return pivot["market"], pivot["date"], pivot["label"], pivot["expected_zone"]


def _match_champion_pivots(champion: dict[str, Any], challenger: dict[str, Any]) -> dict[str, Any]:
    """Score the challenger on the cases used for the recorded champion."""
    champion_pivots = champion.get("pivot_details")
    if not champion_pivots:
        return challenger

    candidate_pivots = {_pivot_key(pivot): pivot for pivot in challenger.get("pivot_details", [])}
    matched = []
    for pivot in champion_pivots:
        key = _pivot_key(pivot)
        candidate = candidate_pivots.get(key)
        if candidate is None:
            market, date, label, zone = key
            raise ValueError(f"Challenger is missing champion pivot {market} {date} {label!r} (expected {zone})")
        matched.append(candidate)

    metrics = {
        **challenger["metrics"],
        "pivot_directional_rate": round(sum(p["directional_pass"] for p in matched) / len(matched), 4),
        "pivot_strict_rate": round(sum(p["strict_pass"] for p in matched) / len(matched), 4),
    }
    return {**challenger, "metrics": metrics}


def _main() -> int:
    parser = argparse.ArgumentParser(description="Run champion-challenger gate check")
    parser.add_argument("--champion", type=Path, required=True, help="Path to champion.json")
    parser.add_argument("--challenger", type=Path, required=True, help="Path to challenger latest.json")
    args = parser.parse_args()

    if not args.champion.exists():
        print(f"ERROR: champion file not found: {args.champion}", file=sys.stderr)
        return 3
    if not args.challenger.exists():
        print(f"ERROR: challenger file not found: {args.challenger}", file=sys.stderr)
        return 3

    champion = json.loads(args.champion.read_text())
    challenger = json.loads(args.challenger.read_text())

    try:
        challenger = _match_champion_pivots(champion, challenger)
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    if champion.get("pivot_details"):
        print(f"Comparing pivot hit rates on the champion's {len(champion['pivot_details'])} cases.")

    report = diff(champion, challenger)
    print(report.format_text())

    return report.exit_code


if __name__ == "__main__":
    sys.exit(_main())
