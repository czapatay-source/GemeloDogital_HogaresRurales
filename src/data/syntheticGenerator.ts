/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CountryCode, HouseholdAgent, RuralTypology } from '../types';
import { COUNTRIES_DATA } from './countries';

// Pseudo-Random Number Generator with reproducible seed (Mulberry32)
export function createRng(seed: number) {
  let s = Math.floor(seed) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Normal distribution approximation using Box-Muller transform
function sampleNormal(rng: () => number, mean: number, stdDev: number): number {
  const u1 = Math.max(1e-7, rng());
  const u2 = rng();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

// Log-normal distribution for skewed variables like income and assets
function sampleLogNormal(rng: () => number, median: number, sigma: number): number {
  const mu = Math.log(Math.max(1, median));
  const normalVal = sampleNormal(rng, mu, sigma);
  return Math.exp(normalVal);
}

export function generateSyntheticHouseholds(
  countryCode: CountryCode,
  count?: number,
  seed: number = 2026
): HouseholdAgent[] {
  const country = COUNTRIES_DATA[countryCode];
  const sampleSize = count || country.sampleSizeDemonstration;
  const rng = createRng(seed + countryCode.charCodeAt(0) * 100 + countryCode.charCodeAt(1));

  const households: HouseholdAgent[] = [];

  const typologies: RuralTypology[] = ['Andina', 'Amazonica', 'VallesCosteros', 'AridaSecano', 'GranChaco', 'PampeanaPatagonia'];

  // Geographic coordinates bounding box approximation
  const baseLat = country.latitude;
  const baseLng = country.longitude;

  // Calibrated benchmarks per country
  const pLineExtreme = country.povertyLineExtremeUSD_PPP;
  const pLineModerate = country.povertyLineModerateUSD_PPP;

  for (let i = 0; i < sampleSize; i++) {
    const id = `HH-${countryCode}-${String(i + 1).padStart(4, '0')}`;
    const regionName = country.regions[Math.floor(rng() * country.regions.length)];
    const typology = typologies[Math.floor(rng() * typologies.length)];

    // Slight geographic jitter around base country coords
    const latitude = baseLat + (rng() - 0.5) * 5.0;
    const longitude = baseLng + (rng() - 0.5) * 5.0;

    // Survey design weights: Expansion factors (represents ~150 to 1200 real rural households per observation)
    const expansionFactor = Math.round(150 + rng() * 850);
    const clusterId = `PSU-${countryCode}-${Math.floor(i / 15) + 1}`;
    const stratumId = `STR-${countryCode}-${typology}`;

    // Demographics
    const householdSize = Math.max(1, Math.min(11, Math.round(sampleNormal(rng, 4.6, 1.8))));
    const numChildren = Math.max(0, Math.min(householdSize - 1, Math.round(sampleNormal(rng, 2.1, 1.4))));
    const numElderly = householdSize > numChildren + 1 && rng() < 0.28 ? Math.round(1 + rng() * 1) : 0;
    const activeAdults = Math.max(1, householdSize - numChildren - numElderly);
    const dependencyRatio = Number(((numChildren + numElderly) / activeAdults).toFixed(2));
    const femaleHead = rng() < 0.29;
    const indigenousOrAfro = countryCode === 'BOL' || countryCode === 'PER' || countryCode === 'GUY' || countryCode === 'SUR'
      ? rng() < 0.58
      : rng() < 0.22;

    const headEducationYears = Math.max(0, Math.min(16, Math.round(sampleNormal(rng, 5.8, 3.2))));
    const childrenSchoolAttendancePct = numChildren === 0 ? 100 : Math.min(100, Math.max(20, Math.round(sampleNormal(rng, 84, 16))));

    // Productive assets
    const landHectares = Number(Math.max(0.1, sampleLogNormal(rng, typology === 'PampeanaPatagonia' ? 18.0 : 2.8, 0.9)).toFixed(1));
    const livestockUnits = Math.round(Math.max(0, sampleLogNormal(rng, 4.5, 0.8)));
    const irrigationAccess = typology === 'VallesCosteros' ? rng() < 0.65 : rng() < 0.18;
    const electricityAccess = rng() < 0.78;
    const roadDistanceKm = Number(Math.max(0.5, sampleLogNormal(rng, 14.0, 0.7)).toFixed(1));
    const physicalAssetIndex = Number(
      Math.min(1.0, Math.max(0.05, 0.2 + (electricityAccess ? 0.25 : 0) + (irrigationAccess ? 0.2 : 0) + (headEducationYears / 25) + rng() * 0.15)).toFixed(3)
    );

    // Employment
    const informalEmployedMembers = Math.min(activeAdults, Math.max(1, Math.round(sampleNormal(rng, activeAdults * 0.85, 0.6))));
    const formalEmployedMembers = Math.max(0, activeAdults - informalEmployedMembers);
    const creditAccess = physicalAssetIndex > 0.45 && rng() < 0.35;
    const savingsBalanceUSD_PPP = creditAccess ? Math.round(sampleLogNormal(rng, 120, 1.1)) : Math.round(rng() * 40);
    const debtBalanceUSD_PPP = creditAccess && rng() < 0.4 ? Math.round(sampleLogNormal(rng, 220, 0.8)) : 0;

    // Climate vulnerability indices (0 to 1) based on typology and lack of assets
    const droughtVulnerability = Number(
      Math.min(1.0, Math.max(0.1, (typology === 'AridaSecano' || typology === 'GranChaco' ? 0.75 : 0.35) + (irrigationAccess ? -0.25 : 0.15) + rng() * 0.15)).toFixed(2)
    );
    const floodVulnerability = Number(
      Math.min(1.0, Math.max(0.1, (typology === 'Amazonica' || typology === 'VallesCosteros' ? 0.70 : 0.25) + rng() * 0.2)).toFixed(2)
    );
    const frostVulnerability = Number(
      Math.min(1.0, Math.max(0.1, (typology === 'Andina' ? 0.80 : 0.10) + rng() * 0.15)).toFixed(2)
    );

    // Baseline Income Structure (USD PPP per capita monthly)
    // Agricultural subsistence income depends on land, livestock and typology
    const baselineFarmIncomePerCapita = Number(
      Math.max(10, (landHectares * 18 + livestockUnits * 12 + (irrigationAccess ? 45 : 0)) / householdSize + rng() * 25).toFixed(1)
    );
    // Non-farm labor income
    const baselineLaborIncomePerCapita = Number(
      Math.max(15, (formalEmployedMembers * 210 + informalEmployedMembers * 75 + headEducationYears * 6) / householdSize + sampleNormal(rng, 20, 12)).toFixed(1)
    );
    // Existing baseline social transfer (if country program covers them)
    const hasBaselineTransfer = country.officialPrograms.length > 0 && (numChildren > 0 || numElderly > 0) && rng() < 0.62;
    const baselineTransferIncomePerCapita = hasBaselineTransfer
      ? Number((country.officialPrograms[0].monthlyBenefitUSD_PPP / householdSize).toFixed(1))
      : 0;

    const baselineTotalIncomePerCapita = Number(
      (baselineFarmIncomePerCapita + baselineLaborIncomePerCapita + baselineTransferIncomePerCapita).toFixed(1)
    );

    // Consumption follows Keynesian MPC with subsistence baseline
    const baselineConsumptionPerCapita = Number(
      Math.max(25, 30 + 0.75 * baselineTotalIncomePerCapita + sampleNormal(rng, 0, 10)).toFixed(1)
    );
    const foodSharePct = Number(
      Math.min(88, Math.max(35, 78 - (baselineConsumptionPerCapita / 12) + (numChildren * 2))).toFixed(1)
    );

    // Poverty status determination against international USD PPP lines
    let baselinePovertyStatus: 'extreme' | 'moderate' | 'non_poor' = 'non_poor';
    if (baselineConsumptionPerCapita < pLineExtreme) {
      baselinePovertyStatus = 'extreme';
    } else if (baselineConsumptionPerCapita < pLineModerate) {
      baselinePovertyStatus = 'moderate';
    }

    households.push({
      id,
      countryCode,
      regionName,
      typology,
      latitude,
      longitude,
      expansionFactor,
      clusterId,
      stratumId,
      householdSize,
      numChildren,
      numElderly,
      dependencyRatio,
      femaleHead,
      indigenousOrAfro,
      headEducationYears,
      childrenSchoolAttendancePct,
      landHectares,
      livestockUnits,
      physicalAssetIndex,
      irrigationAccess,
      electricityAccess,
      roadDistanceKm,
      formalEmployedMembers,
      informalEmployedMembers,
      creditAccess,
      savingsBalanceUSD_PPP,
      debtBalanceUSD_PPP,
      baselineLaborIncomePerCapita,
      baselineFarmIncomePerCapita,
      baselineTransferIncomePerCapita,
      baselineTotalIncomePerCapita,
      baselineConsumptionPerCapita,
      foodSharePct,
      baselinePovertyStatus,
      droughtVulnerability,
      floodVulnerability,
      frostVulnerability,

      // Initial simulation values mirror baseline
      simulatedLaborIncomePerCapita: baselineLaborIncomePerCapita,
      simulatedFarmIncomePerCapita: baselineFarmIncomePerCapita,
      simulatedTransferIncomePerCapita: baselineTransferIncomePerCapita,
      simulatedTotalIncomePerCapita: baselineTotalIncomePerCapita,
      simulatedConsumptionPerCapita: baselineConsumptionPerCapita,
      simulatedPovertyStatus: baselinePovertyStatus,
      isEligibleForTransfer: false,
      transferReceivedUSD_PPP: 0,
      conditionalityComplied: true,
      experiencedShock: false,
      copingStrategy: 'ninguna'
    });
  }

  return households;
}
