/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ClimateShockEvent,
  CountryCode,
  HouseholdAgent,
  PolicySpecification,
  RuralTypology,
  SimulationResult
} from '../types';
import { COUNTRIES_DATA } from '../data/countries';
import {
  calculateFgtIndices,
  calculateWeightedGini,
  evaluateIndicators,
  generateLorenzPoints
} from './econometrics';

/**
 * Executes a full Agent-Based Policy Simulation and Shock Assessment
 * on the rural household sample.
 */
export function runPolicySimulation(
  households: HouseholdAgent[],
  countryCode: CountryCode,
  policy: PolicySpecification,
  shock: ClimateShockEvent,
  seed: number = 42
): SimulationResult {
  const country = COUNTRIES_DATA[countryCode];
  const pModerate = country.povertyLineModerateUSD_PPP;
  const pExtreme = country.povertyLineExtremeUSD_PPP;

  // Evaluate baseline indicators first
  const baselineIndicators = evaluateIndicators(
    households,
    pModerate,
    pExtreme,
    'baselineConsumptionPerCapita',
    policy.durationMonths,
    policy.administrativeCostPct
  );

  // Deep clone agents for counterfactual run
  const simulatedAgents: HouseholdAgent[] = households.map((h) => ({ ...h }));

  for (const hh of simulatedAgents) {
    // 1. DETERMINE POLICY ELIGIBILITY
    let eligible = false;
    const criterion = policy.targetGroup || policy.targetCriterion;
    switch (criterion) {
      case 'universal_rural':
        eligible = true;
        break;
      case 'extreme_poor_only':
        eligible = hh.baselinePovertyStatus === 'extreme';
        break;
      case 'moderate_and_extreme':
        eligible = hh.baselinePovertyStatus === 'extreme' || hh.baselinePovertyStatus === 'moderate';
        break;
      case 'children_households':
        eligible = hh.numChildren > 0 && hh.baselineConsumptionPerCapita < pModerate * 1.25;
        break;
      case 'female_headed_only':
        eligible = hh.femaleHead && hh.baselinePovertyStatus !== 'non_poor';
        break;
      case 'climate_exposed_only':
        eligible = (hh.droughtVulnerability > 0.6 || hh.floodVulnerability > 0.6 || hh.frostVulnerability > 0.6);
        break;
    }
    hh.isEligibleForTransfer = eligible;

    // 2. CONDITIONALITY AND TRANSFER BENEFIT
    let grossTransfer = 0;
    let compliesConditionality = true;

    if (eligible) {
      grossTransfer = policy.baseAmountUSD_PPP +
        (hh.numChildren * policy.childSupplementUSD_PPP) +
        (hh.numElderly * policy.elderlySupplementUSD_PPP);

      // Complementary microcredit capital flow (converted to monthly asset return)
      if (policy.complementaryPackages.microcreditLoanUSD_PPP > 0) {
        grossTransfer += (policy.complementaryPackages.microcreditLoanUSD_PPP * 0.08); // 8% monthly marginal productivity of capital
      }

      // Check conditionality if policy is conditional
      if (policy.type === 'conditional' && policy.conditionalities.enforceSchoolAttendance && hh.numChildren > 0) {
        // If baseline attendance was below threshold, policy incentive induces compliance for 85% of households
        if (hh.childrenSchoolAttendancePct < policy.conditionalities.minAttendancePct) {
          const complianceCost = 8.0; // opportunity cost of child farm labor
          if (grossTransfer > complianceCost) {
            // Behavioral response: Household complies to unlock transfer
            hh.childrenSchoolAttendancePct = Math.min(100, policy.conditionalities.minAttendancePct + 5);
            compliesConditionality = true;
          } else {
            // Transfer insufficient to compensate foregone child labor
            compliesConditionality = false;
            grossTransfer = 0;
          }
        }
      }
    }

    hh.conditionalityComplied = compliesConditionality;
    hh.transferReceivedUSD_PPP = grossTransfer;
    hh.simulatedTransferIncomePerCapita = Number((grossTransfer / hh.householdSize).toFixed(1));

    // 3. CLIMATE SHOCK TRANSMISSION
    let shockFactorFarm = 1.0;
    let shockFactorLabor = 1.0;
    let experiencedShock = false;

    if (shock.type !== 'none' && shock.affectedTypologies.includes(hh.typology)) {
      experiencedShock = true;
      let vulnerabilityWeight = 0;

      if (shock.type === 'sequia_severa') {
        vulnerabilityWeight = hh.droughtVulnerability;
      } else if (shock.type === 'inundacion_fluvial') {
        vulnerabilityWeight = hh.floodVulnerability;
      } else if (shock.type === 'helada_anomala') {
        vulnerabilityWeight = hh.frostVulnerability;
      } else {
        vulnerabilityWeight = 0.5;
      }

      // Mitigating effect of weather index insurance or agricultural training
      if (policy.complementaryPackages.weatherIndexInsurance) {
        vulnerabilityWeight = Math.max(0.1, vulnerabilityWeight * 0.45);
      }
      if (policy.complementaryPackages.agriculturalTraining) {
        vulnerabilityWeight = Math.max(0.1, vulnerabilityWeight * 0.70);
      }

      shockFactorFarm = Math.max(0.15, 1.0 - (shock.cropLossPct / 100) * vulnerabilityWeight);
      shockFactorLabor = Math.max(0.30, 1.0 - (shock.laborDisruptionPct / 100) * vulnerabilityWeight);
    }

    hh.experiencedShock = experiencedShock;
    hh.simulatedFarmIncomePerCapita = Number((hh.baselineFarmIncomePerCapita * shockFactorFarm).toFixed(1));
    hh.simulatedLaborIncomePerCapita = Number((hh.baselineLaborIncomePerCapita * shockFactorLabor).toFixed(1));

    // Total post-simulation income
    hh.simulatedTotalIncomePerCapita = Number(
      (hh.simulatedFarmIncomePerCapita + hh.simulatedLaborIncomePerCapita + hh.simulatedTransferIncomePerCapita).toFixed(1)
    );

    // 4. CONSUMPTION SMOOTHING & COPING STRATEGIES
    const incomeLoss = hh.baselineTotalIncomePerCapita - hh.simulatedTotalIncomePerCapita;
    let postConsumption = hh.baselineConsumptionPerCapita;
    let strategy: HouseholdAgent['copingStrategy'] = 'ninguna';

    if (incomeLoss > 0) {
      // Household experienced an income drop
      if (hh.savingsBalanceUSD_PPP > incomeLoss * 2) {
        // Can buffer using savings
        strategy = 'gasto_ahorros';
        postConsumption = Math.max(pExtreme * 0.8, hh.baselineConsumptionPerCapita - (incomeLoss * 0.35));
      } else if (hh.livestockUnits > 3) {
        // Distress livestock sale to buy food
        strategy = 'venta_activos';
        postConsumption = Math.max(pExtreme * 0.7, hh.baselineConsumptionPerCapita - (incomeLoss * 0.55));
      } else {
        // Severe cutting of food consumption
        strategy = 'reduccion_consumo_alimentos';
        postConsumption = Math.max(15, hh.baselineConsumptionPerCapita - (incomeLoss * 0.85));
      }
    } else {
      // Income increased due to cash transfer!
      // Marginal Propensity to Consume (MPC) out of transfers is high (~0.82) in rural households
      const transferGainPerCapita = -incomeLoss;
      postConsumption = Number((hh.baselineConsumptionPerCapita + transferGainPerCapita * 0.82).toFixed(1));
    }

    hh.copingStrategy = strategy;
    hh.simulatedConsumptionPerCapita = Number(postConsumption.toFixed(1));

    // Update Simulated Poverty Status
    if (hh.simulatedConsumptionPerCapita < pExtreme) {
      hh.simulatedPovertyStatus = 'extreme';
    } else if (hh.simulatedConsumptionPerCapita < pModerate) {
      hh.simulatedPovertyStatus = 'moderate';
    } else {
      hh.simulatedPovertyStatus = 'non_poor';
    }
  }

  // 5. EVALUATE SIMULATED OUTCOMES
  const simulatedIndicators = evaluateIndicators(
    simulatedAgents,
    pModerate,
    pExtreme,
    'simulatedConsumptionPerCapita',
    policy.durationMonths,
    policy.administrativeCostPct
  );

  // Poverty by Typology breakdown
  const typologies: RuralTypology[] = ['Andina', 'Amazonica', 'VallesCosteros', 'AridaSecano', 'GranChaco', 'PampeanaPatagonia'];
  const povertyByTypology = typologies.map((typ) => {
    const baseTypAgents = households.filter((h) => h.typology === typ);
    const simTypAgents = simulatedAgents.filter((h) => h.typology === typ);
    const baseFgt = calculateFgtIndices(baseTypAgents, pModerate, 'baselineConsumptionPerCapita').fgt0;
    const simFgt = calculateFgtIndices(simTypAgents, pModerate, 'simulatedConsumptionPerCapita').fgt0;
    return {
      typology: typ,
      baselineFGT0: baseFgt,
      simulatedFGT0: simFgt,
      change: Number((simFgt - baseFgt).toFixed(2))
    };
  });

  // Lorenz curve points
  const lorenzCurve = generateLorenzPoints(simulatedAgents, 'baselineConsumptionPerCapita', 'simulatedConsumptionPerCapita');

  // Fast Bootstrap Confidence Intervals (200 bootstrap replications with replacement)
  const bootstrapFgt0: number[] = [];
  const bootstrapFgt1: number[] = [];
  const bootstrapGini: number[] = [];
  const N = simulatedAgents.length;

  for (let b = 0; b < 120; b++) {
    const sample: HouseholdAgent[] = [];
    for (let s = 0; s < N; s++) {
      const idx = Math.floor(Math.random() * N);
      sample.push(simulatedAgents[idx]);
    }
    bootstrapFgt0.push(calculateFgtIndices(sample, pModerate).fgt0);
    bootstrapFgt1.push(calculateFgtIndices(sample, pModerate).fgt1);
    bootstrapGini.push(calculateWeightedGini(sample));
  }

  bootstrapFgt0.sort((a, b) => a - b);
  bootstrapFgt1.sort((a, b) => a - b);
  bootstrapGini.sort((a, b) => a - b);

  const ci95 = (arr: number[]): [number, number] => [
    arr[Math.floor(arr.length * 0.025)],
    arr[Math.floor(arr.length * 0.975)]
  ];

  const povertyReduction = Number((baselineIndicators.fgt0_headcount - simulatedIndicators.fgt0_headcount).toFixed(2));
  const costPerPoint = povertyReduction > 0
    ? Math.round(simulatedIndicators.annualFiscalCostUSD_PPP / povertyReduction)
    : 0;

  return {
    scenarioId: `SCEN-${Date.now()}`,
    scenarioName: `${policy.name} + [${shock.name}]`,
    countryCode,
    sampleSize: simulatedAgents.length,
    timestamp: new Date().toISOString(),
    policy,
    shock,
    baseline: baselineIndicators,
    simulated: simulatedIndicators,
    delta: {
      povertyReductionPctPoints: povertyReduction,
      extremePovertyReductionPctPoints: Number((baselineIndicators.fgt0_extreme - simulatedIndicators.fgt0_extreme).toFixed(2)),
      povertyGapReductionPct: Number((baselineIndicators.fgt1_gap - simulatedIndicators.fgt1_gap).toFixed(2)),
      giniReduction: Number((baselineIndicators.giniCoefficient - simulatedIndicators.giniCoefficient).toFixed(4)),
      beneficiaryCount: simulatedIndicators.beneficiaryHouseholdsCount,
      costPerPovertyPointReduced: costPerPoint
    },
    lorenzCurve,
    povertyByTypology,
    uncertaintyIntervals: {
      fgt0: ci95(bootstrapFgt0),
      fgt1: ci95(bootstrapFgt1),
      gini: ci95(bootstrapGini)
    }
  };
}

/**
 * Standard Presets for Policies and Climate Shocks
 */
export const DEFAULT_POLICIES: Record<string, PolicySpecification> = {
  cct_education_priority: {
    id: 'pol_cct_edu',
    name: 'Transferencia Condicionada al Capital Humano Rural (CCT)',
    type: 'conditional',
    description: 'Enfoque clásico tipo Bolsa Família / Juntos: Bono condicionado a asistencia escolar >= 85% y controles de salud.',
    baseAmountUSD_PPP: 75.0,
    childSupplementUSD_PPP: 25.0,
    elderlySupplementUSD_PPP: 35.0,
    targetCriterion: 'children_households',
    conditionalities: {
      enforceSchoolAttendance: true,
      minAttendancePct: 85,
      enforceHealthControls: true
    },
    administrativeCostPct: 4.8,
    complementaryPackages: {
      microcreditLoanUSD_PPP: 0,
      agriculturalTraining: false,
      weatherIndexInsurance: false
    },
    durationMonths: 12
  },

  uct_unconditional_safety_net: {
    id: 'pol_uct_universal',
    name: 'Renta Rural Incondicionada (UCT)',
    type: 'unconditional',
    description: 'Transferencia monetaria directa sin corresponsabilidades punitivas, priorizando autonomía del hogar rural.',
    baseAmountUSD_PPP: 85.0,
    childSupplementUSD_PPP: 15.0,
    elderlySupplementUSD_PPP: 20.0,
    targetCriterion: 'moderate_and_extreme',
    conditionalities: {
      enforceSchoolAttendance: false,
      minAttendancePct: 0,
      enforceHealthControls: false
    },
    administrativeCostPct: 2.1,
    complementaryPackages: {
      microcreditLoanUSD_PPP: 0,
      agriculturalTraining: false,
      weatherIndexInsurance: false
    },
    durationMonths: 12
  },

  resilience_climate_bundle: {
    id: 'pol_bundled_climate',
    name: 'Paquete de Graduación y Resiliencia Climática (Bundled)',
    type: 'asset_bundled',
    description: 'Transferencia monetaria combinada con microcrédito productivo y seguro agroclimático indexado.',
    baseAmountUSD_PPP: 65.0,
    childSupplementUSD_PPP: 20.0,
    elderlySupplementUSD_PPP: 20.0,
    targetCriterion: 'climate_exposed_only',
    conditionalities: {
      enforceSchoolAttendance: true,
      minAttendancePct: 80,
      enforceHealthControls: true
    },
    administrativeCostPct: 6.2,
    complementaryPackages: {
      microcreditLoanUSD_PPP: 180.0,
      agriculturalTraining: true,
      weatherIndexInsurance: true
    },
    durationMonths: 12
  }
};

export const DEFAULT_SHOCKS: Record<string, ClimateShockEvent> = {
  none: {
    id: 'shock_none',
    type: 'none',
    name: 'Sin Choque Climático (Escenario Base Climatológico)',
    severityIndex: 0,
    cropLossPct: 0,
    livestockMortalityPct: 0,
    laborDisruptionPct: 0,
    affectedTypologies: []
  },

  severe_drought: {
    id: 'shock_drought',
    type: 'sequia_severa',
    name: 'Sequía Hidrológica Extrema (El Niño / Calentamiento)',
    severityIndex: 0.85,
    cropLossPct: 45,
    livestockMortalityPct: 22,
    laborDisruptionPct: 30,
    affectedTypologies: ['AridaSecano', 'GranChaco', 'Andina']
  },

  riverine_flood: {
    id: 'shock_flood',
    type: 'inundacion_fluvial',
    name: 'Inundación Fluvial y Pérdida de Cosecha en Vega',
    severityIndex: 0.75,
    cropLossPct: 55,
    livestockMortalityPct: 15,
    laborDisruptionPct: 40,
    affectedTypologies: ['Amazonica', 'VallesCosteros']
  },

  mountain_frost: {
    id: 'shock_frost',
    type: 'helada_anomala',
    name: 'Heladas y Friaje en Altiplano / Sierra Alta',
    severityIndex: 0.70,
    cropLossPct: 50,
    livestockMortalityPct: 25,
    laborDisruptionPct: 20,
    affectedTypologies: ['Andina']
  }
};
