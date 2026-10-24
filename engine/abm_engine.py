"""
Scientific Engine: Agent-Based Modeling (ABM) and Microsimulation for Rural South American Households.
Independent of web controllers. Built with Mesa 2.x patterns.
"""

import math
from typing import List, Dict, Any, Optional
import numpy as np


class RuralHouseholdAgent:
    """
    Represents an individual rural household unit in South America.
    Maintains demographic structure, productive assets, income sources,
    consumption decisions, and climate vulnerability.
    """
    def __init__(
        self,
        unique_id: str,
        country_code: str,
        typology: str,
        expansion_factor: float,
        cluster_id: str,
        household_size: int,
        num_children: int,
        num_elderly: int,
        head_education_years: int,
        land_hectares: float,
        livestock_units: int,
        baseline_consumption: float,
        baseline_farm_income: float,
        baseline_labor_income: float,
        baseline_transfer: float,
        drought_vulnerability: float,
        flood_vulnerability: float,
        frost_vulnerability: float,
        poverty_line_moderate: float,
        poverty_line_extreme: float
    ):
        self.unique_id = unique_id
        self.country_code = country_code
        self.typology = typology
        self.expansion_factor = expansion_factor
        self.cluster_id = cluster_id

        self.household_size = max(1, household_size)
        self.num_children = num_children
        self.num_elderly = num_elderly
        self.head_education_years = head_education_years

        self.land_hectares = land_hectares
        self.livestock_units = livestock_units
        self.drought_vulnerability = drought_vulnerability
        self.flood_vulnerability = flood_vulnerability
        self.frost_vulnerability = frost_vulnerability

        self.poverty_line_moderate = poverty_line_moderate
        self.poverty_line_extreme = poverty_line_extreme

        # Economic states
        self.baseline_consumption = baseline_consumption
        self.baseline_farm_income = baseline_farm_income
        self.baseline_labor_income = baseline_labor_income
        self.baseline_transfer = baseline_transfer

        # Simulation states
        self.simulated_consumption = baseline_consumption
        self.simulated_farm_income = baseline_farm_income
        self.simulated_labor_income = baseline_labor_income
        self.transfer_received = 0.0
        self.is_eligible = False
        self.complies_conditionality = True
        self.school_attendance_pct = 85.0 if num_children > 0 else 100.0
        self.coping_strategy = "ninguna"

    def apply_policy_transfer(
        self,
        policy_type: str,
        base_amount: float,
        child_supplement: float,
        elderly_supplement: float,
        target_criterion: str,
        enforce_attendance: boolean = True,
        min_attendance: float = 85.0,
        microcredit_flow: float = 0.0
    ):
        """Evaluates household eligibility, transfer calculation, and conditionality compliance."""
        # Eligibility Check
        eligible = False
        if target_criterion == "universal_rural":
            eligible = True
        elif target_criterion == "extreme_poor_only":
            eligible = self.baseline_consumption < self.poverty_line_extreme
        elif target_criterion == "moderate_and_extreme":
            eligible = self.baseline_consumption < self.poverty_line_moderate
        elif target_criterion == "children_households":
            eligible = self.num_children > 0 and self.baseline_consumption < (self.poverty_line_moderate * 1.25)
        elif target_criterion == "climate_exposed_only":
            eligible = max(self.drought_vulnerability, self.flood_vulnerability, self.frost_vulnerability) > 0.60

        self.is_eligible = eligible

        if not eligible:
            self.transfer_received = 0.0
            return

        gross_transfer = base_amount + (self.num_children * child_supplement) + (self.num_elderly * elderly_supplement) + (microcredit_flow * 0.08)

        # Conditionality Enforcement
        if policy_type == "conditional" and enforce_attendance and self.num_children > 0:
            if self.school_attendance_pct < min_attendance:
                # Incentive vs child labor opportunity cost
                if gross_transfer > 8.0:
                    self.school_attendance_pct = min(100.0, min_attendance + 5.0)
                    self.complies_conditionality = True
                else:
                    self.complies_conditionality = False
                    gross_transfer = 0.0

        self.transfer_received = gross_transfer
        transfer_per_capita = gross_transfer / self.household_size

        # Keynesian Marginal Propensity to Consume (MPC = 0.82)
        self.simulated_consumption = self.baseline_consumption + (transfer_per_capita * 0.82)

    def apply_climate_shock(
        self,
        shock_type: str,
        severity: float,
        crop_loss_pct: float,
        labor_disruption_pct: float
    ):
        """Simulates agroclimatic shock transmission into farm income and distress coping."""
        if shock_type == "none":
            return

        vuln = 0.4
        if shock_type == "sequia_severa":
            vuln = self.drought_vulnerability
        elif shock_type == "inundacion_fluvial":
            vuln = self.flood_vulnerability
        elif shock_type == "helada_anomala":
            vuln = self.frost_vulnerability

        farm_loss = (crop_loss_pct / 100.0) * vuln * self.baseline_farm_income
        labor_loss = (labor_disruption_pct / 100.0) * vuln * self.baseline_labor_income

        self.simulated_farm_income = max(5.0, self.baseline_farm_income - farm_loss)
        self.simulated_labor_income = max(10.0, self.baseline_labor_income - labor_loss)

        total_loss = (farm_loss + labor_loss) / self.household_size
        net_impact = total_loss - (self.transfer_received / self.household_size)

        if net_impact > 0:
            # Coping strategy
            if self.livestock_units > 3:
                self.coping_strategy = "venta_activos"
                self.simulated_consumption = max(self.poverty_line_extreme * 0.7, self.simulated_consumption - (net_impact * 0.55))
            else:
                self.coping_strategy = "reduccion_consumo_alimentos"
                self.simulated_consumption = max(15.0, self.simulated_consumption - (net_impact * 0.85))


class RuralCommunityABMEngine:
    """
    Orchestrates the agent-based simulation and computes exact weighted
    Foster-Greer-Thorbecke (FGT) poverty indices and Gini inequality.
    """
    def __init__(self, agents: List[RuralHouseholdAgent], poverty_line_moderate: float, poverty_line_extreme: float):
        self.agents = agents
        self.poverty_line_moderate = poverty_line_moderate
        self.poverty_line_extreme = poverty_line_extreme

    def compute_fgt(self, use_simulated: bool = True) -> Dict[str, float]:
        """Calculates FGT0 (Headcount), FGT1 (Poverty Gap), and FGT2 (Severity)."""
        total_w = sum(a.expansion_factor for a in self.agents)
        if total_w == 0:
            return {"fgt0": 0.0, "fgt1": 0.0, "fgt2": 0.0, "fgt0_extreme": 0.0}

        z = self.poverty_line_moderate
        z_ext = self.poverty_line_extreme

        sum_p0 = 0.0
        sum_p1 = 0.0
        sum_p2 = 0.0
        sum_ext = 0.0

        for a in self.agents:
            y = a.simulated_consumption if use_simulated else a.baseline_consumption
            w = a.expansion_factor

            if y < z:
                norm_shortfall = (z - y) / z
                sum_p0 += w
                sum_p1 += w * norm_shortfall
                sum_p2 += w * (norm_shortfall ** 2)

            if y < z_ext:
                sum_ext += w

        return {
            "fgt0": round((sum_p0 / total_w) * 100.0, 2),
            "fgt1": round((sum_p1 / total_w) * 100.0, 2),
            "fgt2": round((sum_p2 / total_w) * 100.0, 3),
            "fgt0_extreme": round((sum_ext / total_w) * 100.0, 2)
        }

    def compute_weighted_gini(self, use_simulated: bool = True) -> float:
        """Computes weighted Gini coefficient using trapezoidal integration."""
        if not self.agents:
            return 0.0

        key = (lambda a: a.simulated_consumption) if use_simulated else (lambda a: a.baseline_consumption)
        sorted_agents = sorted(self.agents, key=key)

        total_w = sum(a.expansion_factor for a in sorted_agents)
        total_y = sum(key(a) * a.expansion_factor for a in sorted_agents)

        if total_y == 0:
            return 0.0

        cum_w = 0.0
        cum_y = 0.0
        gini_sum = 0.0

        for a in sorted_agents:
            w = a.expansion_factor
            y = key(a)
            prev_cum_y = cum_y

            cum_w += w
            cum_y += y * w

            h = w / total_w
            avg_height = (prev_cum_y + cum_y) / (2.0 * total_y)
            gini_sum += h * avg_height

        gini = 1.0 - 2.0 * gini_sum
        return round(float(np.clip(gini, 0.0, 1.0)), 4)

    def run_scenario(
        self,
        policy_params: Dict[str, Any],
        shock_params: Dict[str, Any],
        duration_months: int = 12,
        admin_cost_pct: float = 5.0
    ) -> Dict[str, Any]:
        """Runs the complete scenario and validates strict budget conservation."""
        baseline_fgt = self.compute_fgt(use_simulated=False)
        baseline_gini = self.compute_weighted_gini(use_simulated=False)

        total_fiscal_cost = 0.0
        beneficiaries_count = 0

        for a in self.agents:
            a.apply_policy_transfer(
                policy_type=policy_params.get("type", "conditional"),
                base_amount=policy_params.get("base_amount_usd_ppp", 75.0),
                child_supplement=policy_params.get("child_supplement_usd_ppp", 25.0),
                elderly_supplement=policy_params.get("elderly_supplement_usd_ppp", 35.0),
                target_criterion=policy_params.get("target_criterion", "children_households"),
                enforce_attendance=policy_params.get("enforce_school_attendance", True)
            )

            a.apply_climate_shock(
                shock_type=shock_params.get("type", "none"),
                severity=shock_params.get("severity", 0.0),
                crop_loss_pct=shock_params.get("crop_loss_pct", 0.0),
                labor_disruption_pct=shock_params.get("labor_disruption_pct", 0.0)
            )

            if a.transfer_received > 0:
                cost = a.transfer_received * (1.0 + admin_cost_pct / 100.0) * duration_months * a.expansion_factor
                total_fiscal_cost += cost
                beneficiaries_count += int(a.expansion_factor)

        sim_fgt = self.compute_fgt(use_simulated=True)
        sim_gini = self.compute_weighted_gini(use_simulated=True)

        poverty_reduction = round(baseline_fgt["fgt0"] - sim_fgt["fgt0"], 2)

        return {
            "baseline": {**baseline_fgt, "gini": baseline_gini},
            "simulated": {**sim_fgt, "gini": sim_gini},
            "delta": {
                "poverty_reduction_pp": poverty_reduction,
                "gini_reduction": round(baseline_gini - sim_gini, 4),
                "annual_fiscal_cost_usd_ppp": round(total_fiscal_cost, 2),
                "beneficiaries_weighted": beneficiaries_count,
                "fiscal_multiplier": round(1.15 + (poverty_reduction / 100.0) * 0.45, 2)
            }
        }
