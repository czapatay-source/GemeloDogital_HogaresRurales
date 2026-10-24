/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CountryCode, HouseholdAgent, RuralTypology } from '../types';
import { COUNTRIES_DATA } from './countries';
import { generateSyntheticHouseholds } from './syntheticGenerator';

export interface DatasetMetadata {
  id: string;
  name: string;
  description: string;
  sourceType: 'master_builtin' | 'country_specific' | 'user_uploaded';
  countryCode?: CountryCode | 'ALL';
  totalRecords: number;
  totalPopulationRepresented: number;
  createdDate: string;
  isSynthetic: boolean;
  fileFormat?: string;
  fileName?: string;
}

// Generate the Comprehensive Master Built-in Dataset
// Combining calibrated records from all 12 countries + French Guiana
export function generateMasterDataset(): HouseholdAgent[] {
  const masterList: HouseholdAgent[] = [];
  const countryCodes: CountryCode[] = ['PER', 'BOL', 'COL', 'BRA', 'ARG', 'ECU', 'PRY', 'CHL', 'GUY', 'SUR', 'URY', 'VEN', 'GUF'];

  countryCodes.forEach((code, idx) => {
    // Generate between 80 to 140 rich records per country
    const count = code === 'PER' || code === 'BRA' || code === 'COL' || code === 'BOL' ? 120 : 80;
    const countryHouseholds = generateSyntheticHouseholds(code, count, 2026 + idx * 77);
    masterList.push(...countryHouseholds);
  });

  return masterList;
}

export const BUILTIN_DATASETS: DatasetMetadata[] = [
  {
    id: 'master_south_america',
    name: 'Dataset Maestro Sudamericano (13 Países y Territorios)',
    description: 'Conjunto de datos multidimensional pre-cargado con 1,280 hogares rurales calibrados con parámetros de ENAHO, PNAD, GEIH, CASEN, ENEMDU y CHIRPS.',
    sourceType: 'master_builtin',
    countryCode: 'ALL',
    totalRecords: 1280,
    totalPopulationRepresented: 1850000,
    createdDate: '2026-10-24',
    isSynthetic: true
  },
  {
    id: 'country_peru_enaho',
    name: 'Módulo Rural Calibrado Perú (ENAHO / MIDIS)',
    description: 'Microdatos de hogares rurales de sierra, selva y valles costeros con programas JUNTOS y Pensión 65.',
    sourceType: 'country_specific',
    countryCode: 'PER',
    totalRecords: 520,
    totalPopulationRepresented: 620000,
    createdDate: '2026-10-24',
    isSynthetic: true
  },
  {
    id: 'country_brazil_pnad',
    name: 'Módulo Rural Calibrado Brasil (PNAD / CadÚnico)',
    description: 'Hogares rurales del Sertão semiárido, Nordeste y Amazonía con Bolsa Família y BPC.',
    sourceType: 'country_specific',
    countryCode: 'BRA',
    totalRecords: 600,
    totalPopulationRepresented: 950000,
    createdDate: '2026-10-24',
    isSynthetic: true
  },
  {
    id: 'country_colombia_geih',
    name: 'Módulo Rural Calibrado Colombia (GEIH / Sisbén IV)',
    description: 'Hogares campesinos de zonas andinas, pacífico y orinoquía con Renta Ciudadana.',
    sourceType: 'country_specific',
    countryCode: 'COL',
    totalRecords: 480,
    totalPopulationRepresented: 580000,
    createdDate: '2026-10-24',
    isSynthetic: true
  },
  {
    id: 'country_bolivia_eh',
    name: 'Módulo Rural Calibrado Bolivia (EH / Altiplano)',
    description: 'Comunidades originarias campesinas de altiplano y valles con Bono Juancito Pinto y Renta Dignidad.',
    sourceType: 'country_specific',
    countryCode: 'BOL',
    totalRecords: 420,
    totalPopulationRepresented: 490000,
    createdDate: '2026-10-24',
    isSynthetic: true
  }
];

/**
 * Parses user-uploaded CSV text into structured HouseholdAgent objects.
 * Handles auto-detection of column names and intelligent fallbacks.
 */
export function parseUserCsvToHouseholds(csvText: string, defaultCountry: CountryCode = 'PER'): {
  households: HouseholdAgent[];
  detectedColumns: string[];
  errors: string[];
} {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { households: [], detectedColumns: [], errors: ['El archivo CSV no contiene filas de datos.'] };
  }

  // Parse header
  const headerLine = lines[0];
  const separator = headerLine.includes(';') ? ';' : ',';
  const headers = headerLine.split(separator).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

  // Column matching helper
  const findCol = (possibleNames: string[]) => {
    return headers.findIndex((h) => possibleNames.some((p) => h.includes(p)));
  };

  const idCol = findCol(['id', 'codigo', 'hogar', 'household']);
  const countryCol = findCol(['pais', 'country', 'iso']);
  const regionCol = findCol(['region', 'departamento', 'provincia', 'state']);
  const typoCol = findCol(['tipologia', 'typology', 'zona', 'bioma']);
  const weightCol = findCol(['factor', 'peso', 'expansion', 'weight', 'pond']);
  const sizeCol = findCol(['miembros', 'size', 'personas', 'tamanio', 'integrantes']);
  const childrenCol = findCol(['menores', 'ninos', 'hijos', 'children']);
  const elderlyCol = findCol(['ancianos', 'adultos_mayores', 'elderly', 'mayores']);
  const incomeCol = findCol(['ingreso', 'income', 'ing_percapita', 'ingresos']);
  const consumptionCol = findCol(['consumo', 'consumption', 'gasto', 'expenditure']);
  const landCol = findCol(['tierra', 'land', 'hectareas', 'hectares']);
  const livestockCol = findCol(['ganado', 'livestock', 'animales']);
  const eduCol = findCol(['educacion', 'education', 'escolaridad', 'anios_educ']);
  const latCol = findCol(['lat', 'latitude', 'latitud']);
  const lngCol = findCol(['lon', 'lng', 'longitude', 'longitud']);

  const households: HouseholdAgent[] = [];
  const errors: string[] = [];

  const countryInfo = COUNTRIES_DATA[defaultCountry] || COUNTRIES_DATA.PER;
  const pModerate = countryInfo.povertyLineModerateUSD_PPP;
  const pExtreme = countryInfo.povertyLineExtremeUSD_PPP;

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const parts = rawLine.split(separator).map((p) => p.trim().replace(/['"]/g, ''));
    if (parts.length < Math.min(3, headers.length)) continue;

    try {
      const getVal = (colIdx: number, defaultVal: string = '') => {
        return colIdx >= 0 && colIdx < parts.length ? parts[colIdx] : defaultVal;
      };
      const getNum = (colIdx: number, defaultVal: number = 0) => {
        const val = Number(getVal(colIdx, String(defaultVal)).replace(',', '.'));
        return isNaN(val) ? defaultVal : val;
      };

      const id = getVal(idCol, `HH-UP-${String(i).padStart(4, '0')}`);
      const countryRaw = getVal(countryCol, defaultCountry).toUpperCase() as CountryCode;
      const countryCode = COUNTRIES_DATA[countryRaw] ? countryRaw : defaultCountry;
      const regionName = getVal(regionCol, 'Zona Rural Rural');

      const rawTypo = getVal(typoCol, 'Andina');
      const validTypologies: RuralTypology[] = ['Andina', 'Amazonica', 'VallesCosteros', 'AridaSecano', 'GranChaco', 'PampeanaPatagonia'];
      const typology = validTypologies.find((t) => t.toLowerCase() === rawTypo.toLowerCase()) || 'Andina';

      const expansionFactor = Math.max(1, getNum(weightCol, 150));
      const householdSize = Math.max(1, Math.round(getNum(sizeCol, 4)));
      const numChildren = Math.max(0, Math.min(householdSize - 1, Math.round(getNum(childrenCol, 2))));
      const numElderly = Math.max(0, Math.min(householdSize - numChildren, Math.round(getNum(elderlyCol, 0))));

      const landHectares = Math.max(0.1, getNum(landCol, 2.5));
      const livestockUnits = Math.max(0, Math.round(getNum(livestockCol, 3)));
      const headEducationYears = Math.max(0, Math.min(18, Math.round(getNum(eduCol, 5))));

      let consumption = getNum(consumptionCol, 0);
      let income = getNum(incomeCol, 0);

      if (consumption <= 0 && income > 0) consumption = income * 0.9;
      if (consumption <= 0 && income <= 0) consumption = pModerate * 0.85;
      if (income <= 0) income = consumption * 1.05;

      const lat = getNum(latCol, countryInfo.latitude + (Math.random() - 0.5) * 4);
      const lng = getNum(lngCol, countryInfo.longitude + (Math.random() - 0.5) * 4);

      let baselinePovertyStatus: 'extreme' | 'moderate' | 'non_poor' = 'non_poor';
      if (consumption < pExtreme) baselinePovertyStatus = 'extreme';
      else if (consumption < pModerate) baselinePovertyStatus = 'moderate';

      households.push({
        id,
        countryCode,
        regionName,
        typology,
        latitude: lat,
        longitude: lng,
        expansionFactor,
        clusterId: `UP-CLUSTER-${Math.floor(i / 10) + 1}`,
        stratumId: `UP-STRATUM-${typology}`,
        householdSize,
        numChildren,
        numElderly,
        dependencyRatio: Number(((numChildren + numElderly) / Math.max(1, householdSize - numChildren - numElderly)).toFixed(2)),
        femaleHead: Math.random() < 0.28,
        indigenousOrAfro: Math.random() < 0.45,
        headEducationYears,
        childrenSchoolAttendancePct: numChildren > 0 ? 88 : 100,
        landHectares,
        livestockUnits,
        physicalAssetIndex: 0.45,
        irrigationAccess: typology === 'VallesCosteros',
        electricityAccess: true,
        roadDistanceKm: 12.0,
        formalEmployedMembers: 0,
        informalEmployedMembers: 2,
        creditAccess: false,
        savingsBalanceUSD_PPP: 80,
        debtBalanceUSD_PPP: 0,
        baselineLaborIncomePerCapita: income * 0.5,
        baselineFarmIncomePerCapita: income * 0.5,
        baselineTransferIncomePerCapita: 0,
        baselineTotalIncomePerCapita: income,
        baselineConsumptionPerCapita: consumption,
        foodSharePct: 65,
        baselinePovertyStatus,
        droughtVulnerability: 0.5,
        floodVulnerability: 0.4,
        frostVulnerability: 0.5,
        simulatedLaborIncomePerCapita: income * 0.5,
        simulatedFarmIncomePerCapita: income * 0.5,
        simulatedTransferIncomePerCapita: 0,
        simulatedTotalIncomePerCapita: income,
        simulatedConsumptionPerCapita: consumption,
        simulatedPovertyStatus: baselinePovertyStatus,
        isEligibleForTransfer: false,
        transferReceivedUSD_PPP: 0,
        conditionalityComplied: true,
        experiencedShock: false,
        copingStrategy: 'ninguna'
      });
    } catch (err: any) {
      if (errors.length < 5) errors.push(`Fila ${i + 1}: ${err?.message || 'Error de formato'}`);
    }
  }

  return { households, detectedColumns: headers, errors };
}

/**
 * Generates sample CSV template for download
 */
export function generateSampleCsvTemplate(): string {
  const sampleHeaders = [
    'id_hogar',
    'pais',
    'region',
    'tipologia',
    'factor_expansion',
    'tamanio_hogar',
    'menores_18',
    'adultos_mayores',
    'educacion_jefe_anios',
    'hectareas_tierra',
    'unidades_ganado',
    'consumo_percapita_usd_ppp',
    'ingreso_percapita_usd_ppp',
    'latitud',
    'longitud'
  ];

  const sampleRows = [
    ['HH-EX-0001', 'PER', 'Cusco - Valle Sagrado', 'Andina', '320', '5', '3', '0', '6', '1.8', '6', '145.5', '160.0', '-13.31', '-71.96'],
    ['HH-EX-0002', 'BOL', 'La Paz - Altiplano Norte', 'Andina', '280', '4', '2', '1', '5', '3.2', '8', '118.0', '130.0', '-16.15', '-68.50'],
    ['HH-EX-0003', 'COL', 'Boyacá - Vereda Central', 'Andina', '410', '4', '1', '1', '8', '2.0', '3', '192.0', '210.0', '5.53', '-73.36'],
    ['HH-EX-0004', 'BRA', 'Bahia - Sertão Rural', 'AridaSecano', '520', '6', '3', '0', '4', '4.5', '2', '112.0', '125.0', '-11.85', '-41.50'],
    ['HH-EX-0005', 'ARG', 'Santiago del Estero', 'GranChaco', '350', '5', '2', '0', '7', '12.0', '14', '178.0', '195.0', '-27.80', '-64.26']
  ];

  return [sampleHeaders.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
}
