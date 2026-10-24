/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EconometricIndicators, HouseholdAgent } from '../types';

/**
 * Calculates Foster-Greer-Thorbecke (FGT) poverty indices (P0, P1, P2)
 * using sampling expansion factors (weights).
 *
 * P_alpha = (1 / W) * sum_{i: y_i < z} w_i * ((z - y_i) / z)^alpha
 */
export function calculateFgtIndices(
  households: HouseholdAgent[],
  povertyLine: number,
  incomeKey: 'simulatedConsumptionPerCapita' | 'baselineConsumptionPerCapita' = 'simulatedConsumptionPerCapita'
): { fgt0: number; fgt1: number; fgt2: number } {
  let totalWeight = 0;
  let sumP0 = 0;
  let sumP1 = 0;
  let sumP2 = 0;

  for (const hh of households) {
    const w = hh.expansionFactor;
    const y = hh[incomeKey];
    totalWeight += w;

    if (y < povertyLine) {
      const normalizedShortfall = (povertyLine - y) / povertyLine;
      sumP0 += w;
      sumP1 += w * normalizedShortfall;
      sumP2 += w * Math.pow(normalizedShortfall, 2);
    }
  }

  if (totalWeight === 0) return { fgt0: 0, fgt1: 0, fgt2: 0 };

  return {
    fgt0: Number(((sumP0 / totalWeight) * 100).toFixed(2)),
    fgt1: Number(((sumP1 / totalWeight) * 100).toFixed(2)),
    fgt2: Number(((sumP2 / totalWeight) * 100).toFixed(3))
  };
}

/**
 * Weighted Gini Coefficient calculation
 */
export function calculateWeightedGini(
  households: HouseholdAgent[],
  incomeKey: 'simulatedConsumptionPerCapita' | 'baselineConsumptionPerCapita' = 'simulatedConsumptionPerCapita'
): number {
  if (households.length === 0) return 0;

  // Sort by income ascending
  const sorted = [...households].sort((a, b) => a[incomeKey] - b[incomeKey]);

  let totalWeight = 0;
  for (const hh of sorted) totalWeight += hh.expansionFactor;

  let totalWeightedIncome = 0;
  for (const hh of sorted) {
    totalWeightedIncome += hh[incomeKey] * hh.expansionFactor;
  }

  if (totalWeightedIncome === 0) return 0;

  let cumulativeWeight = 0;
  let cumulativeWeightedIncome = 0;
  let giniSum = 0;

  for (const hh of sorted) {
    const w = hh.expansionFactor;
    const y = hh[incomeKey];
    const prevCumInc = cumulativeWeightedIncome;

    cumulativeWeight += w;
    cumulativeWeightedIncome += y * w;

    // Trapezoidal rule integration for Lorenz curve
    const h = w / totalWeight;
    const avgHeight = (prevCumInc + cumulativeWeightedIncome) / (2 * totalWeightedIncome);
    giniSum += h * avgHeight;
  }

  const gini = 1 - 2 * giniSum;
  return Number(Math.max(0, Math.min(1, gini)).toFixed(4));
}

/**
 * Calculates the Palma Ratio: Share of top 10% / Share of bottom 40%
 */
export function calculatePalmaRatio(
  households: HouseholdAgent[],
  incomeKey: 'simulatedConsumptionPerCapita' | 'baselineConsumptionPerCapita' = 'simulatedConsumptionPerCapita'
): number {
  if (households.length === 0) return 0;

  const sorted = [...households].sort((a, b) => a[incomeKey] - b[incomeKey]);
  let totalWeight = 0;
  for (const hh of sorted) totalWeight += hh.expansionFactor;

  const weight40 = totalWeight * 0.40;
  const weight90 = totalWeight * 0.90;

  let cumWeight = 0;
  let bottom40Income = 0;
  let top10Income = 0;

  for (const hh of sorted) {
    const w = hh.expansionFactor;
    const y = hh[incomeKey] * w;
    const prevCum = cumWeight;
    cumWeight += w;

    if (prevCum < weight40) {
      const shareIn = Math.min(cumWeight, weight40) - prevCum;
      bottom40Income += (shareIn / w) * y;
    }

    if (cumWeight > weight90) {
      const shareIn = cumWeight - Math.max(prevCum, weight90);
      top10Income += (shareIn / w) * y;
    }
  }

  if (bottom40Income <= 0) return 9.99;
  return Number((top10Income / bottom40Income).toFixed(2));
}

/**
 * Generates 10-point Lorenz Curve for plotting
 */
export function generateLorenzPoints(
  households: HouseholdAgent[],
  baselineKey: 'baselineConsumptionPerCapita' = 'baselineConsumptionPerCapita',
  simulatedKey: 'simulatedConsumptionPerCapita' = 'simulatedConsumptionPerCapita'
) {
  const deciles = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

  const calcCurve = (key: 'baselineConsumptionPerCapita' | 'simulatedConsumptionPerCapita') => {
    const sorted = [...households].sort((a, b) => a[key] - b[key]);
    let totalW = 0;
    let totalY = 0;
    for (const h of sorted) {
      totalW += h.expansionFactor;
      totalY += h[key] * h.expansionFactor;
    }

    const curvePoints: number[] = [0];

    for (let d = 1; d <= 10; d++) {
      const targetW = totalW * (d / 10);
      let runningW = 0;
      let runningY = 0;
      for (const h of sorted) {
        runningW += h.expansionFactor;
        runningY += h[key] * h.expansionFactor;
        if (runningW >= targetW) break;
      }
      curvePoints.push(Number((runningY / totalY).toFixed(4)));
    }
    return curvePoints;
  };

  const baselineCurve = calcCurve(baselineKey);
  const simulatedCurve = calcCurve(simulatedKey);

  return deciles.map((p, idx) => ({
    cumulativePopulation: p,
    cumulativeIncomeBaseline: baselineCurve[idx],
    cumulativeIncomeSimulated: simulatedCurve[idx]
  }));
}

/**
 * Comprehensive evaluation of all econometric and fiscal indicators
 */
export function evaluateIndicators(
  households: HouseholdAgent[],
  povertyLineModerate: number,
  povertyLineExtreme: number,
  incomeKey: 'simulatedConsumptionPerCapita' | 'baselineConsumptionPerCapita' = 'simulatedConsumptionPerCapita',
  durationMonths: number = 12,
  adminCostPct: number = 5.0
): EconometricIndicators {
  const fgtModerate = calculateFgtIndices(households, povertyLineModerate, incomeKey);
  const fgtExtreme = calculateFgtIndices(households, povertyLineExtreme, incomeKey);
  const gini = calculateWeightedGini(households, incomeKey);
  const palma = calculatePalmaRatio(households, incomeKey);

  let totalWeight = 0;
  let totalIncome = 0;
  let totalConsumption = 0;
  let beneficiaryHouseholdsWeighted = 0;
  let beneficiaryIndividualsWeighted = 0;
  let poorHouseholdsWeighted = 0;
  let poorBeneficiariesWeighted = 0;
  let nonPoorBeneficiariesWeighted = 0;
  let totalFiscalCost = 0;
  let totalSchoolAttendanceWeighted = 0;
  let forcedAssetSaleWeighted = 0;
  let severeFoodInsecurityWeighted = 0;

  for (const hh of households) {
    const w = hh.expansionFactor;
    totalWeight += w;
    totalIncome += hh.simulatedTotalIncomePerCapita * w;
    totalConsumption += hh[incomeKey] * w;
    totalSchoolAttendanceWeighted += hh.childrenSchoolAttendancePct * w;

    if (hh.copingStrategy === 'venta_activos') {
      forcedAssetSaleWeighted += w;
    }
    if (hh.foodSharePct > 75 && hh[incomeKey] < povertyLineExtreme) {
      severeFoodInsecurityWeighted += w;
    }

    const isPoor = hh[incomeKey] < povertyLineModerate;
    if (isPoor) poorHouseholdsWeighted += w;

    if (hh.transferReceivedUSD_PPP > 0) {
      beneficiaryHouseholdsWeighted += w;
      beneficiaryIndividualsWeighted += w * hh.householdSize;

      // Fiscal cost accounting strictly adheres to budget equations
      const transferCostWithAdmin = hh.transferReceivedUSD_PPP * (1 + adminCostPct / 100) * durationMonths;
      totalFiscalCost += transferCostWithAdmin * w;

      if (isPoor) {
        poorBeneficiariesWeighted += w;
      } else {
        nonPoorBeneficiariesWeighted += w;
      }
    }
  }

  const coverageOfPoor = poorHouseholdsWeighted > 0
    ? (poorBeneficiariesWeighted / poorHouseholdsWeighted) * 100
    : 0;
  const exclusionError = poorHouseholdsWeighted > 0
    ? ((poorHouseholdsWeighted - poorBeneficiariesWeighted) / poorHouseholdsWeighted) * 100
    : 0;
  const inclusionError = beneficiaryHouseholdsWeighted > 0
    ? (nonPoorBeneficiariesWeighted / beneficiaryHouseholdsWeighted) * 100
    : 0;

  // Empirical rural fiscal multiplier:
  // Base 1.15 + boost if targeting poor households with high marginal propensity to consume (MPC)
  const fiscalMultiplier = Number((1.15 + (coverageOfPoor / 100) * 0.28).toFixed(2));

  return {
    fgt0_headcount: fgtModerate.fgt0,
    fgt0_extreme: fgtExtreme.fgt0,
    fgt1_gap: fgtModerate.fgt1,
    fgt2_severity: fgtModerate.fgt2,
    giniCoefficient: gini,
    palmaRatio: palma,
    meanPerCapitaIncome: Number((totalIncome / totalWeight).toFixed(1)),
    meanPerCapitaConsumption: Number((totalConsumption / totalWeight).toFixed(1)),
    annualFiscalCostUSD_PPP: Math.round(totalFiscalCost),
    beneficiaryHouseholdsCount: Math.round(beneficiaryHouseholdsWeighted),
    beneficiaryIndividualsCount: Math.round(beneficiaryIndividualsWeighted),
    coverageOfPoorPct: Number(coverageOfPoor.toFixed(1)),
    exclusionErrorPct: Number(exclusionError.toFixed(1)),
    inclusionErrorPct: Number(inclusionError.toFixed(1)),
    fiscalMultiplierEstimate: fiscalMultiplier,
    childSchoolAttendancePct: Number((totalSchoolAttendanceWeighted / totalWeight).toFixed(1)),
    householdsForcedAssetSalePct: Number(((forcedAssetSaleWeighted / totalWeight) * 100).toFixed(1)),
    severeFoodInsecurityPct: Number(((severeFoodInsecurityWeighted / totalWeight) * 100).toFixed(1))
  };
}
