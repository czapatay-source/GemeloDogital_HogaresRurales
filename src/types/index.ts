/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CountryCode =
  | 'ARG'
  | 'BOL'
  | 'BRA'
  | 'CHL'
  | 'COL'
  | 'ECU'
  | 'GUY'
  | 'PRY'
  | 'PER'
  | 'SUR'
  | 'URY'
  | 'VEN'
  | 'GUF';

export type RuralTypology =
  | 'Andina'
  | 'Amazonica'
  | 'VallesCosteros'
  | 'AridaSecano'
  | 'GranChaco'
  | 'PampeanaPatagonia';

export interface OfficialProgram {
  id: string;
  name: string;
  acronym: string;
  type: 'conditional' | 'unconditional' | 'non_contributory_pension' | 'food_stamp';
  implementingAgency: string;
  targetPopulation: string;
  monthlyBenefitUSD_PPP: number;
  conditionalityDetails?: string;
  officialSourceUrl: string;
}

export interface StatisticalSource {
  institution: string;
  acronym: string;
  url: string;
  datasetName: string;
  country: string;
  coverage: string;
  availablePeriods: string[];
  frequency: 'mensual' | 'trimestral' | 'semestral' | 'anual' | 'bianual';
  dataType: 'transversal_repetida' | 'panel' | 'administrativo' | 'raster_climatico';
  keyVariables: string[];
  license: string;
  accessRestrictions: string;
  lastUpdateDate: string;
  geoPrecision: 'nacional' | 'departamental' | 'municipal' | 'grilla_0.05deg';
  limitations: string;
}

export interface CountryProfile {
  code: CountryCode;
  name: string;
  nameEn: string;
  currencyCode: string;
  currencySymbol: string;
  exchangeRateUSD: number; // local per USD
  pppFactor: number; // Purchasing Power Parity factor per USD
  povertyLineModerateUSD_PPP: number; // e.g. 6.85 USD PPP/day converted to monthly
  povertyLineExtremeUSD_PPP: number; // e.g. 3.65 or 2.15 USD PPP/day converted to monthly
  primaryStatisticalInstitute: string;
  sampleSizeDemonstration: number;
  ruralPopulationPct: number;
  latitude: number;
  longitude: number;
  regions: string[];
  officialPrograms: OfficialProgram[];
  sources: StatisticalSource[];
  climateRiskProfile: {
    droughtRisk: 'Alto' | 'Medio' | 'Bajo';
    floodRisk: 'Alto' | 'Medio' | 'Bajo';
    frostRisk: 'Alto' | 'Medio' | 'Bajo';
    climateVulnerabilityScore: number; // 0 - 100
  };
}

export interface HouseholdAgent {
  id: string;
  countryCode: CountryCode;
  regionName: string;
  typology: RuralTypology;
  latitude: number;
  longitude: number;
  expansionFactor: number; // Factor de ponderación demográfica
  clusterId: string;
  stratumId: string;

  // Demographics
  householdSize: number;
  numChildren: number; // < 18
  numElderly: number; // >= 65
  dependencyRatio: number;
  femaleHead: boolean;
  indigenousOrAfro: boolean;
  headEducationYears: number;
  childrenSchoolAttendancePct: number; // 0 - 100

  // Productive Assets & Land
  landHectares: number;
  livestockUnits: number;
  physicalAssetIndex: number; // 0 - 1 scale
  irrigationAccess: boolean;
  electricityAccess: boolean;
  roadDistanceKm: number;

  // Employment & Financial Inclusion
  formalEmployedMembers: number;
  informalEmployedMembers: number;
  creditAccess: boolean;
  savingsBalanceUSD_PPP: number;
  debtBalanceUSD_PPP: number;

  // Income & Consumption (USD PPP / month per capita)
  baselineLaborIncomePerCapita: number;
  baselineFarmIncomePerCapita: number;
  baselineTransferIncomePerCapita: number;
  baselineTotalIncomePerCapita: number;
  baselineConsumptionPerCapita: number;
  foodSharePct: number;
  baselinePovertyStatus: 'extreme' | 'moderate' | 'non_poor';

  // Climate sensitivities
  droughtVulnerability: number; // 0 - 1
  floodVulnerability: number; // 0 - 1
  frostVulnerability: number; // 0 - 1

  // Simulation variables (dynamically updated)
  simulatedLaborIncomePerCapita: number;
  simulatedFarmIncomePerCapita: number;
  simulatedTransferIncomePerCapita: number;
  simulatedTotalIncomePerCapita: number;
  simulatedConsumptionPerCapita: number;
  simulatedPovertyStatus: 'extreme' | 'moderate' | 'non_poor';
  isEligibleForTransfer: boolean;
  transferReceivedUSD_PPP: number;
  conditionalityComplied: boolean;
  experiencedShock: boolean;
  copingStrategy: 'ninguna' | 'gasto_ahorros' | 'venta_activos' | 'reduccion_consumo_alimentos' | 'deuda';
}

export interface PolicySpecification {
  id: string;
  name: string;
  type: 'conditional' | 'unconditional' | 'emergency_climate_transfer' | 'asset_bundled';
  description: string;
  baseAmountUSD_PPP: number; // monthly per household
  childSupplementUSD_PPP: number; // per child
  elderlySupplementUSD_PPP: number; // per elderly
  targetCriterion:
    | 'universal_rural'
    | 'extreme_poor_only'
    | 'moderate_and_extreme'
    | 'children_households'
    | 'female_headed_only'
    | 'climate_exposed_only';
  targetGroup?:
    | 'universal_rural'
    | 'extreme_poor_only'
    | 'moderate_and_extreme'
    | 'children_households'
    | 'female_headed_only'
    | 'climate_exposed_only';
  conditionalities: {
    enforceSchoolAttendance: boolean;
    minAttendancePct: number;
    enforceHealthControls: boolean;
  };
  administrativeCostPct: number; // e.g. 5%
  complementaryPackages: {
    microcreditLoanUSD_PPP: number;
    agriculturalTraining: boolean;
    weatherIndexInsurance: boolean;
  };
  durationMonths: number;
}

export interface ClimateShockEvent {
  id: string;
  type: 'none' | 'sequia_severa' | 'inundacion_fluvial' | 'helada_anomala' | 'shock_precios_insumos';
  name: string;
  severityIndex: number; // 0 - 1
  cropLossPct: number; // % reduction in agricultural income
  livestockMortalityPct: number;
  laborDisruptionPct: number;
  affectedTypologies: RuralTypology[];
}

export interface EconometricIndicators {
  // Foster-Greer-Thorbecke
  fgt0_headcount: number; // % P0
  fgt0_extreme: number; // % P0 extrema
  fgt1_gap: number; // % P1
  fgt2_severity: number; // P2 (squared poverty gap)
  giniCoefficient: number; // 0 - 1
  palmaRatio: number; // Decile 10 / Bottom 40
  meanPerCapitaIncome: number;
  meanPerCapitaConsumption: number;

  // Fiscal & Program performance
  annualFiscalCostUSD_PPP: number;
  beneficiaryHouseholdsCount: number;
  beneficiaryIndividualsCount: number;
  coverageOfPoorPct: number; // Sensitivity / Targeting efficiency
  exclusionErrorPct: number; // Type I error: Poor excluded
  inclusionErrorPct: number; // Type II error: Non-poor included
  fiscalMultiplierEstimate: number; // Dynamic impact on local rural economy

  // Human Capital & Asset dynamics
  childSchoolAttendancePct: number;
  householdsForcedAssetSalePct: number;
  severeFoodInsecurityPct: number;
}

export interface SimulationResult {
  scenarioId: string;
  scenarioName: string;
  countryCode: CountryCode;
  sampleSize: number;
  timestamp: string;
  policy: PolicySpecification;
  shock: ClimateShockEvent;
  baseline: EconometricIndicators;
  simulated: EconometricIndicators;
  delta: {
    povertyReductionPctPoints: number;
    extremePovertyReductionPctPoints: number;
    povertyGapReductionPct: number;
    giniReduction: number;
    beneficiaryCount: number;
    costPerPovertyPointReduced: number;
  };
  lorenzCurve: { cumulativePopulation: number; cumulativeIncomeBaseline: number; cumulativeIncomeSimulated: number }[];
  povertyByTypology: { typology: RuralTypology; baselineFGT0: number; simulatedFGT0: number; change: number }[];
  uncertaintyIntervals: {
    fgt0: [number, number]; // 95% Bootstrap CI
    fgt1: [number, number];
    gini: [number, number];
  };
}

export interface MLModelExperiment {
  id: string;
  name: string;
  taskType: 'classification_poverty' | 'regression_income';
  algorithm: 'logistic_or_ridge' | 'random_forest' | 'gradient_boosting';
  features: string[];
  targetVariable: string;
  hyperparameters: Record<string, string | number | boolean>;
  trainingMetrics: {
    trainScore: number;
    valScore: number;
    testScore: number;
    accuracy?: number;
    f1Score?: number;
    rocAuc?: number;
    prAuc?: number;
    brierScore?: number;
    mae?: number;
    rmse?: number;
    r2?: number;
  };
  crossValidationFolds: number;
  durationMs: number;
  featureImportances: { feature: string; importance: number }[];
  calibrationCurve?: { predictedProb: number; observedFreq: number }[];
  status: 'trained' | 'published' | 'archived';
  dateTrained: string;
}

export interface OptunaTrial {
  trialNumber: number;
  parameters: Record<string, number | string>;
  metricValue: number;
  durationMs: number;
  state: 'COMPLETE' | 'PRUNED';
}

export interface StatisticalTest {
  id: string;
  name: string;
  category: 'predictive_model' | 'policy_simulation';
  hypothesis: string;
  assumptions: string;
  statistic: number;
  statisticName: string;
  pValue: number;
  confidenceInterval: [number, number];
  effectSize: number;
  effectSizeMetric: string;
  multipleTestingCorrection: 'Bonferroni' | 'Benjamini-Hochberg (FDR)' | 'Ninguna';
  adjustedPValue: number;
  verdict: 'Rechaza H0 (Diferencia Significativa)' | 'No Rechaza H0 (Sin Evidencia Suficiente)';
  methodologicalNote: string;
}

export type CrispDmPhase =
  | 'business_understanding'
  | 'data_understanding'
  | 'data_preparation'
  | 'modeling'
  | 'evaluation'
  | 'deployment';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userRole: 'Administrador' | 'Analista de Políticas' | 'Investigador';
  action: string;
  resource: string;
  details: string;
  versionHash: string;
}
