from __future__ import annotations

import json
import sys

import pytest

from finsynapse.eval.gate import _main


@pytest.mark.parametrize(
    ("include_champion_pivot", "pivot_passes", "expected_exit_code"),
    [(True, True, 0), (True, False, 1), (False, False, 1)],
)
def test_gate_compares_challenger_on_champion_pivots(
    tmp_path, monkeypatch, capsys, include_champion_pivot, pivot_passes, expected_exit_code
):
    champion_pivot = {
        "market": "us",
        "date": "2020-03-23",
        "label": "COVID liquidity crash bottom",
        "expected_zone": "cold",
        "directional_pass": True,
        "strict_pass": True,
    }
    metrics = {
        "pivot_directional_rate": 1.0,
        "pivot_strict_rate": 1.0,
        "mean_reversion_strength.3m.us": 0.1,
        "mean_reversion_strength.3m.cn": 0.1,
        "mean_reversion_strength.3m.hk": 0.1,
    }
    extra_pivot = {
        **champion_pivot,
        "date": "2025-04-07",
        "label": "Liberation Day tariff shock",
        "directional_pass": not pivot_passes,
        "strict_pass": not pivot_passes,
    }
    candidate_pivots = [extra_pivot]
    if include_champion_pivot:
        candidate_pivots.append({**champion_pivot, "directional_pass": pivot_passes, "strict_pass": pivot_passes})

    champion = tmp_path / "champion.json"
    challenger = tmp_path / "challenger.json"
    champion.write_text(json.dumps({"metrics": metrics, "pivot_details": [champion_pivot]}))
    challenger.write_text(
        json.dumps(
            {
                "metrics": {**metrics, "pivot_directional_rate": 0.5, "pivot_strict_rate": 0.5},
                "pivot_details": candidate_pivots,
            }
        )
    )
    monkeypatch.setattr(sys, "argv", ["gate", "--champion", str(champion), "--challenger", str(challenger)])

    assert _main() == expected_exit_code
    if not include_champion_pivot:
        assert "missing champion pivot us 2020-03-23" in capsys.readouterr().err
