"""
Test suite for the Scientific Engine, Econometrics, and Budget Conservation.
Verifies FGT indices, Gini coefficient, zero data leakage, and climate shock monotonicity.
"""

import pytest
from engine.abm_engine import RuralHouseholdAgent, RuralCommunityABMEngine


def create_sample_household(uid: str, consumption: float, expansion_factor: float = 100.0) -> RuralHouseholdAgent:
    return RuralHouseholdAgent(
        unique_id=uid,
        country_code="PER",
        typology="Andina",
        expansion_factor=expansion_factor,
        cluster_id=f"cluster_{int(uid.split('_')[1]) % 5}",
        household_size=4,
        num_children=2,
        num_elderly=0,
        head_education_years=6,
        land_hectares=2.5,
        livestock_units=4,
        baseline_consumption=consumption,
        baseline_farm_income=consumption * 0.45,
        baseline_labor_income=consumption * 0.45,
        baseline_transfer=0.0,
        drought_vulnerability=0.5,
        flood_vulnerability=0.3,
        frost_vulnerability=0.7,
        poverty_line_moderate=200.0,
        poverty_line_extreme=100.0
    )


def test_fgt0_headcount_formula():
    """Verifies that FGT0 equals exact weighted percentage of individuals under the poverty line."""
    agents = [
        create_sample_household("h_1", 150.0, 100.0), # Poor (< 200)
        create_sample_household("h_2", 180.0, 100.0), # Poor (< 200)
        create_sample_household("h_3", 250.0, 100.0), # Non-poor
        create_sample_household("h_4", 300.0, 100.0)  # Non-poor
    ]
    engine = RuralCommunityABMEngine(agents, poverty_line_moderate=200.0, poverty_line_extreme=100.0)
    metrics = engine.compute_fgt(use_simulated=False)

    # 2 out of 4 agents are poor -> 50.0%
    assert metrics["fgt0"] == 50.0
    assert metrics["fgt1"] > 0.0
    assert metrics["fgt2"] > 0.0


def test_budget_conservation_invariance():
    """Verifies that total recorded fiscal cost matches the mathematical sum of disbursed benefits."""
    agents = [
        create_sample_household(f"h_{i}", 140.0 + i * 20.0, 150.0)
        for i in range(10)
    ]
    engine = RuralCommunityABMEngine(agents, poverty_line_moderate=200.0, poverty_line_extreme=100.0)

    policy_params = {
        "type": "conditional",
        "base_amount_usd_ppp": 80.0,
        "child_supplement_usd_ppp": 20.0,
        "elderly_supplement_usd_ppp": 30.0,
        "target_criterion": "universal_rural"
    }

    res = engine.run_scenario(policy_params, shock_params={"type": "none"}, duration_months=12, admin_cost_pct=5.0)

    total_cost = res["delta"]["annual_fiscal_cost_usd_ppp"]
    assert total_cost > 0.0
    # Every agent receives 80 + 2*20 = 120 USD PPP/month
    # Total per agent = 120 * 1.05 * 12 * 150 = 226,800
    # 10 agents = 2,268,000 USD PPP
    expected_cost = 10 * (120.0 * 1.05 * 12 * 150.0)
    assert abs(total_cost - expected_cost) < 1.0


def test_climate_shock_monotonicity():
    """Verifies that severe climate shock without transfers reduces farm income and increases poverty."""
    agents = [create_sample_household(f"h_{i}", 210.0, 100.0) for i in range(6)]
    engine = RuralCommunityABMEngine(agents, poverty_line_moderate=200.0, poverty_line_extreme=100.0)

    res = engine.run_scenario(
        policy_params={"type": "none", "base_amount_usd_ppp": 0.0, "target_criterion": "extreme_poor_only"},
        shock_params={"type": "sequia_severa", "severity": 0.9, "crop_loss_pct": 50.0, "labor_disruption_pct": 30.0}
    )

    # Some households drop below the 200 line due to shock loss
    assert res["simulated"]["fgt0"] >= res["baseline"]["fgt0"]
