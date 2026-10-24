/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CountryCode, CountryProfile } from '../types';

export const COUNTRIES_DATA: Record<CountryCode, CountryProfile> = {
  ARG: {
    code: 'ARG',
    name: 'Argentina',
    nameEn: 'Argentina',
    currencyCode: 'ARS',
    currencySymbol: '$',
    exchangeRateUSD: 1050.0,
    pppFactor: 380.0,
    povertyLineModerateUSD_PPP: 205.5, // ~6.85 USD PPP/day * 30
    povertyLineExtremeUSD_PPP: 109.5, // ~3.65 USD PPP/day * 30
    primaryStatisticalInstitute: 'INDEC (Instituto Nacional de Estadística y Censos)',
    sampleSizeDemonstration: 450,
    ruralPopulationPct: 7.9,
    latitude: -34.6037,
    longitude: -58.3816,
    regions: ['NOA (Noroeste)', 'NEA (Noreste)', 'Cuyo', 'Pampeana', 'Patagonia'],
    officialPrograms: [
      {
        id: 'arg_auh',
        name: 'Asignación Universal por Hijo para Protección Social',
        acronym: 'AUH',
        type: 'conditional',
        implementingAgency: 'ANSES (Administración Nacional de la Seguridad Social)',
        targetPopulation: 'Hogares en informalidad, desocupados o servicio doméstico con hijos menores de 18 años.',
        monthlyBenefitUSD_PPP: 85.0,
        conditionalityDetails: 'Acreditación de calendario de vacunación obligatorio y escolaridad regular anual.',
        officialSourceUrl: 'https://www.anses.gob.ar/auh'
      },
      {
        id: 'arg_alimentar',
        name: 'Programa Alimentar',
        acronym: 'Tarjeta Alimentar',
        type: 'food_stamp',
        implementingAgency: 'Ministerio de Capital Humano',
        targetPopulation: 'Madres o padres con hijos hasta 14 años perceptores de AUH.',
        monthlyBenefitUSD_PPP: 52.0,
        officialSourceUrl: 'https://www.argentina.gob.ar/capital-humano/alimentar'
      }
    ],
    sources: [
      {
        institution: 'INDEC',
        acronym: 'INDEC',
        url: 'https://www.indec.gob.ar/',
        datasetName: 'Encuesta Permanente de Hogares (EPH) y Módulos Rurales',
        country: 'Argentina',
        coverage: 'Nacional Urbano y Módulos Experimentales Rurales',
        availablePeriods: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
        frequency: 'semestral',
        dataType: 'transversal_repetida',
        keyVariables: ['ingreso_laboral', 'condicion_actividad', 'educacion', 'tenencia_vivienda', 'asistencia_social'],
        license: 'Open Data Argentina (CC BY 4.0)',
        accessRestrictions: 'Microdatos públicos anonimizados descargables',
        lastUpdateDate: '2024-09-26',
        geoPrecision: 'departamental',
        limitations: 'La EPH continua tradicional cubre 31 aglomerados urbanos; el módulo rural proviene de encuestas complementarias y Censo Nacional Agropecuario.'
      },
      {
        institution: 'Climate Hazards Center / UCSB',
        acronym: 'CHIRPS',
        url: 'https://www.chc.ucsb.edu/data/chirps',
        datasetName: 'CHIRPS Rainfall Estimates v2.0',
        country: 'Sudamérica (Grilla continental)',
        coverage: 'Lat 50S a 50N',
        availablePeriods: ['1981-2024'],
        frequency: 'mensual',
        dataType: 'raster_climatico',
        keyVariables: ['precipitacion_acumulada_mm', 'anomalia_estandarizada_spi'],
        license: 'Public Domain',
        accessRestrictions: 'Acceso libre vía Cloud Open Data y Earth Engine',
        lastUpdateDate: '2024-10-01',
        geoPrecision: 'grilla_0.05deg',
        limitations: 'Resolución de 0.05 grados (aprox 5.5 km); requiere calibración local en zonas andinas con orografía compleja.'
      }
    ],
    climateRiskProfile: {
      droughtRisk: 'Alto',
      floodRisk: 'Medio',
      frostRisk: 'Alto',
      climateVulnerabilityScore: 68.4
    }
  },

  BOL: {
    code: 'BOL',
    name: 'Bolivia',
    nameEn: 'Bolivia',
    currencyCode: 'BOB',
    currencySymbol: 'Bs',
    exchangeRateUSD: 6.96,
    pppFactor: 2.85,
    povertyLineModerateUSD_PPP: 205.5,
    povertyLineExtremeUSD_PPP: 109.5,
    primaryStatisticalInstitute: 'INE Bolivia (Instituto Nacional de Estadística)',
    sampleSizeDemonstration: 420,
    ruralPopulationPct: 29.8,
    latitude: -16.2902,
    longitude: -63.5887,
    regions: ['Altiplano (La Paz, Oruro, Potosí)', 'Valles (Cochabamba, Chuquisaca, Tarija)', 'Llanos/Amazonía (Santa Cruz, Beni, Pando)'],
    officialPrograms: [
      {
        id: 'bol_juancito_pinto',
        name: 'Bono Juancito Pinto',
        acronym: 'BJP',
        type: 'conditional',
        implementingAgency: 'Ministerio de Educación',
        targetPopulation: 'Estudiantes de primaria y secundaria de unidades educativas fiscales y de convenio.',
        monthlyBenefitUSD_PPP: 24.0,
        conditionalityDetails: 'Permanencia escolar y asistencia al menos al 85% de las clases efectivas.',
        officialSourceUrl: 'https://www.minedu.gob.bo/'
      },
      {
        id: 'bol_renta_dignidad',
        name: 'Renta Universal de Vejez (Renta Dignidad)',
        acronym: 'Renta Dignidad',
        type: 'non_contributory_pension',
        implementingAgency: 'Autoridad de Fiscalización y Control de Pensiones y Seguros (APS)',
        targetPopulation: 'Adultos mayores de 60 años residentes sin jubilación formal.',
        monthlyBenefitUSD_PPP: 50.0,
        officialSourceUrl: 'https://www.aps.gob.bo/'
      }
    ],
    sources: [
      {
        institution: 'INE Bolivia',
        acronym: 'INE',
        url: 'https://www.ine.gob.bo/',
        datasetName: 'Encuesta de Hogares (EH)',
        country: 'Bolivia',
        coverage: 'Nacional, Urbano y Rural representativo',
        availablePeriods: ['2017', '2018', '2019', '2020', '2021', '2022', '2023'],
        frequency: 'anual',
        dataType: 'transversal_repetida',
        keyVariables: ['gasto_hogar', 'produccion_agropecuaria_autoconsumo', 'idioma_originario', 'tenencia_tierra'],
        license: 'Uso oficial de estadísticas públicas',
        accessRestrictions: 'Microdatos descargables en formato SPSS/STATA',
        lastUpdateDate: '2024-05-15',
        geoPrecision: 'departamental',
        limitations: 'Muestra rural dispersa con costos de levantamiento; año 2020 afectado por contingencia sanitaria.'
      }
    ],
    climateRiskProfile: {
      droughtRisk: 'Alto',
      floodRisk: 'Alto',
      frostRisk: 'Alto',
      climateVulnerabilityScore: 82.1
    }
  },

  BRA: {
    code: 'BRA',
    name: 'Brasil',
    nameEn: 'Brazil',
    currencyCode: 'BRL',
    currencySymbol: 'R$',
    exchangeRateUSD: 5.65,
    pppFactor: 2.70,
    povertyLineModerateUSD_PPP: 205.5,
    povertyLineExtremeUSD_PPP: 109.5,
    primaryStatisticalInstitute: 'IBGE (Instituto Brasileiro de Geografia e Estatística)',
    sampleSizeDemonstration: 600,
    ruralPopulationPct: 12.2,
    latitude: -14.235,
    longitude: -51.9253,
    regions: ['Norte (Amazônia)', 'Nordeste (Sertão / Semiárido)', 'Centro-Oeste', 'Sudeste', 'Sul'],
    officialPrograms: [
      {
        id: 'bra_bolsa_familia',
        name: 'Programa Bolsa Família (reestruturado Lei 14.601/2023)',
        acronym: 'PBF',
        type: 'conditional',
        implementingAgency: 'Ministério do Desenvolvimento e Assistência Social (MDS)',
        targetPopulation: 'Famílias cadastradas no CadÚnico em situação de pobreza (renda familiar per capita <= R$ 218).',
        monthlyBenefitUSD_PPP: 142.0,
        conditionalityDetails: 'Frequência escolar mínima (60% para 4-5 anos, 75% para 6-18 anos) e acompanhamento pré-natal/vacinação.',
        officialSourceUrl: 'https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia'
      },
      {
        id: 'bra_bpc',
        name: 'Benefício de Prestação Continuada',
        acronym: 'BPC',
        type: 'non_contributory_pension',
        implementingAgency: 'INSS / MDS',
        targetPopulation: 'Idosos (>=65 anos) ou pessoas com deficiência com renda per capita < 1/4 salário mínimo.',
        monthlyBenefitUSD_PPP: 260.0,
        officialSourceUrl: 'https://www.gov.br/inss/'
      }
    ],
    sources: [
      {
        institution: 'IBGE',
        acronym: 'IBGE',
        url: 'https://www.ibge.gov.br/',
        datasetName: 'PNAD Contínua - Pesquisa Nacional por Amostra de Domicílios Contínua',
        country: 'Brasil',
        coverage: 'Nacional, Grandes Regiões, Unidades da Federação e Setores Rurais',
        availablePeriods: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
        frequency: 'trimestral',
        dataType: 'panel',
        keyVariables: ['renda_todos_os_trabalhos', 'outras_fontes_renda', 'bpc_bolsa_familia', 'horas_trabalhadas'],
        license: 'Open Data IBGE',
        accessRestrictions: 'Microdatos completos sin identificadores personales directos',
        lastUpdateDate: '2024-08-16',
        geoPrecision: 'departamental',
        limitations: 'Rotación 1-2(5)-1 de domicilios; cobertura en áreas indígenas remotas depende de censos decenales.'
      }
    ],
    climateRiskProfile: {
      droughtRisk: 'Alto',
      floodRisk: 'Medio',
      frostRisk: 'Bajo',
      climateVulnerabilityScore: 61.5
    }
  },

  CHL: {
    code: 'CHL',
    name: 'Chile',
    nameEn: 'Chile',
    currencyCode: 'CLP',
    currencySymbol: '$',
    exchangeRateUSD: 940.0,
    pppFactor: 490.0,
    povertyLineModerateUSD_PPP: 205.5,
    povertyLineExtremeUSD_PPP: 109.5,
    primaryStatisticalInstitute: 'INE Chile / Ministerio de Desarrollo Social y Familia',
    sampleSizeDemonstration: 380,
    ruralPopulationPct: 12.1,
    latitude: -35.6751,
    longitude: -71.543,
    regions: ['Norte Grande/Chico', 'Centro (Valle Central)', 'Sur (Araucanía, Los Lagos)', 'Austral (Aysén, Magallanes)'],
    officialPrograms: [
      {
        id: 'chl_suf',
        name: 'Subsidio Único Familiar',
        acronym: 'SUF',
        type: 'conditional',
        implementingAgency: 'Instituto de Previsión Social (IPS)',
        targetPopulation: 'Hogares del 60% más vulnerable según el Registro Social de Hogares (RSH) sin previsión formal.',
        monthlyBenefitUSD_PPP: 45.0,
        conditionalityDetails: 'Controles de salud infantil al día y asistencia regular a establecimientos escolares reconocidos.',
        officialSourceUrl: 'https://www.chileatiende.gob.cl/fichas/3300-subsidio-familiar'
      },
      {
        id: 'chl_pgu',
        name: 'Pensión Garantizada Universal',
        acronym: 'PGU',
        type: 'non_contributory_pension',
        implementingAgency: 'IPS',
        targetPopulation: 'Adultos mayores de 65 años que no integren el 10% más rico de la población.',
        monthlyBenefitUSD_PPP: 235.0,
        officialSourceUrl: 'https://www.ips.gob.cl/'
      }
    ],
    sources: [
      {
        institution: 'Ministerio de Desarrollo Social y Familia / INE Chile',
        acronym: 'MDSF',
        url: 'https://observatorio.ministeriodesarrollosocial.gob.cl/encuesta-casen',
        datasetName: 'Encuesta de Caracterización Socioeconómica Nacional (CASEN)',
        country: 'Chile',
        coverage: 'Nacional, Regional, Urbano y Rural',
        availablePeriods: ['2015', '2017', '2020', '2022'],
        frequency: 'bianual',
        dataType: 'transversal_repetida',
        keyVariables: ['ingreso_autonomo', 'subsidios_estatales', 'pobreza_multidimensional', 'etnia_mapuche'],
        license: 'Creative Commons Atribución 3.0 Chile',
        accessRestrictions: 'Bases de datos públicas en formato CSV y R',
        lastUpdateDate: '2023-07-28',
        geoPrecision: 'departamental',
        limitations: 'CASEN 2020 fue encuesta telefónica por pandemia; CASEN 2022 retomó levantamiento presencial completo.'
      }
    ],
    climateRiskProfile: {
      droughtRisk: 'Alto',
      floodRisk: 'Medio',
      frostRisk: 'Medio',
      climateVulnerabilityScore: 54.2
    }
  },

  COL: {
    code: 'COL',
    name: 'Colombia',
    nameEn: 'Colombia',
    currencyCode: 'COP',
    currencySymbol: '$',
    exchangeRateUSD: 4280.0,
    pppFactor: 1650.0,
    povertyLineModerateUSD_PPP: 205.5,
    povertyLineExtremeUSD_PPP: 109.5,
    primaryStatisticalInstitute: 'DANE (Departamento Administrativo Nacional de Estadística)',
    sampleSizeDemonstration: 480,
    ruralPopulationPct: 18.2,
    latitude: 4.5709,
    longitude: -74.2973,
    regions: ['Andina', 'Caribe', 'Pacífico', 'Orinoquía', 'Amazonía'],
    officialPrograms: [
      {
        id: 'col_renta_ciudadana',
        name: 'Programa Renta Ciudadana (antiguo Familias en Acción)',
        acronym: 'Renta Ciudadana',
        type: 'conditional',
        implementingAgency: 'Prosperidad Social (DPS)',
        targetPopulation: 'Hogares en pobreza extrema del Grupo A del Sisbén IV con prioridad en jefatura femenina y niños.',
        monthlyBenefitUSD_PPP: 125.0,
        conditionalityDetails: 'Corresponsabilidad en nutrición, tamizajes de desarrollo infantil y matrícula escolar.',
        officialSourceUrl: 'https://prosperidadsocial.gov.co/sgpp/transferencias/renta-ciudadana/'
      },
      {
        id: 'col_colombia_mayor',
        name: 'Programa de Protección Social al Adulto Mayor',
        acronym: 'Colombia Mayor',
        type: 'non_contributory_pension',
        implementingAgency: 'DPS',
        targetPopulation: 'Adultos mayores desamparados sin pensión en Sisbén A, B y C1.',
        monthlyBenefitUSD_PPP: 48.0,
        officialSourceUrl: 'https://prosperidadsocial.gov.co/'
      }
    ],
    sources: [
      {
        institution: 'DANE',
        acronym: 'DANE',
        url: 'https://www.dane.gov.co/',
        datasetName: 'Gran Encuesta Integrada de Hogares (GEIH) y Módulos Rurales',
        country: 'Colombia',
        coverage: 'Nacional, Cabeceras y Centros Poblados / Rural Disperso',
        availablePeriods: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
        frequency: 'mensual',
        dataType: 'transversal_repetida',
        keyVariables: ['ingresos_totales_percapita', 'informalidad_dane', 'subsidios_monetarios', 'sisben_iv'],
        license: 'Datos Abiertos Colombia',
        accessRestrictions: 'Microdatos anonimizados disponibles en portal DANE',
        lastUpdateDate: '2024-07-30',
        geoPrecision: 'departamental',
        limitations: 'Nuevo marco censal 2018 implementado plenamente a partir del empalme 2021.'
      }
    ],
    climateRiskProfile: {
      droughtRisk: 'Medio',
      floodRisk: 'Alto',
      frostRisk: 'Bajo',
      climateVulnerabilityScore: 71.8
    }
  },

  ECU: {
    code: 'ECU',
    name: 'Ecuador',
    nameEn: 'Ecuador',
    currencyCode: 'USD',
    currencySymbol: '$',
    exchangeRateUSD: 1.0,
    pppFactor: 0.52,
    povertyLineModerateUSD_PPP: 205.5,
    povertyLineExtremeUSD_PPP: 109.5,
    primaryStatisticalInstitute: 'INEC (Instituto Nacional de Estadística y Censos)',
    sampleSizeDemonstration: 400,
    ruralPopulationPct: 35.8,
    latitude: -1.8312,
    longitude: -78.1834,
    regions: ['Sierra (Andes)', 'Costa', 'Amazonía (Oriente)', 'Insular (Galápagos)'],
    officialPrograms: [
      {
        id: 'ecu_bdh',
        name: 'Bono de Desarrollo Humano con Componente Variable',
        acronym: 'BDH',
        type: 'conditional',
        implementingAgency: 'Ministerio de Inclusión Económica y Social (MIES)',
        targetPopulation: 'Hogares en situación de pobreza y extrema pobreza según Registro Social.',
        monthlyBenefitUSD_PPP: 95.0,
        conditionalityDetails: 'Asistencia de hijos a centros de salud preventiva y al menos 80% asistencia escolar.',
        officialSourceUrl: 'https://www.inclusion.gob.ec/bono-de-desarrollo-humano-2/'
      },
      {
        id: 'ecu_adulto_mayor',
        name: 'Pensión para Adultos Mayores Mis Mejores Años',
        acronym: 'Pensión Adulto Mayor',
        type: 'non_contributory_pension',
        implementingAgency: 'MIES',
        targetPopulation: 'Personas de 65 años o más en extrema pobreza no afiliadas a IESS.',
        monthlyBenefitUSD_PPP: 75.0,
        officialSourceUrl: 'https://www.inclusion.gob.ec/'
      }
    ],
    sources: [
      {
        institution: 'INEC Ecuador',
        acronym: 'INEC',
        url: 'https://www.ecuadorencifras.gob.ec/',
        datasetName: 'Encuesta Nacional de Empleo, Desempleo y Subempleo (ENEMDU)',
        country: 'Ecuador',
        coverage: 'Nacional Urbano y Rural representativo',
        availablePeriods: ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
        frequency: 'semestral',
        dataType: 'transversal_repetida',
        keyVariables: ['ingreso_laboral_percapita', 'quintil_ingreso', 'acceso_agua', 'autoidentificacion_indigena'],
        license: 'Open Data Ecuador',
        accessRestrictions: 'Descarga libre de microdatos con factor de ponderación',
        lastUpdateDate: '2024-06-20',
        geoPrecision: 'departamental',
        limitations: 'Economía dolarizada; las canastas analíticas de pobreza utilizan costo calórico directo.'
      }
    ],
    climateRiskProfile: {
      droughtRisk: 'Alto',
      floodRisk: 'Alto',
      frostRisk: 'Medio',
      climateVulnerabilityScore: 74.0
    }
  },

  GUY: {
    code: 'GUY',
    name: 'Guyana',
    nameEn: 'Guyana',
    currencyCode: 'GYD',
    currencySymbol: 'G$',
    exchangeRateUSD: 209.0,
    pppFactor: 95.0,
    povertyLineModerateUSD_PPP: 205.5,
    povertyLineExtremeUSD_PPP: 109.5,
    primaryStatisticalInstitute: 'Bureau of Statistics Guyana',
    sampleSizeDemonstration: 310,
    ruralPopulationPct: 73.2,
    latitude: 4.8604,
    longitude: -58.9302,
    regions: ['Hinterland Regions (1, 7, 8, 9)', 'Coastal Plain (Regions 2, 3, 4, 5, 6, 10)'],
    officialPrograms: [
      {
        id: 'guy_pas',
        name: 'Public Assistance Scheme',
        acronym: 'PAS',
        type: 'unconditional',
        implementingAgency: 'Ministry of Human Services and Social Security',
        targetPopulation: 'Indigent families, individuals unable to work due to medical infirmity.',
        monthlyBenefitUSD_PPP: 62.0,
        officialSourceUrl: 'https://mhsss.gov.gy/'
      },
      {
        id: 'guy_oap',
        name: 'Old Age Pension Program',
        acronym: 'OAP',
        type: 'non_contributory_pension',
        implementingAgency: 'Ministry of Human Services',
        targetPopulation: 'All Guyanese citizens aged 65 and over.',
        monthlyBenefitUSD_PPP: 180.0,
        officialSourceUrl: 'https://mhsss.gov.gy/pension'
      }
    ],
    sources: [
      {
        institution: 'Bureau of Statistics Guyana / World Bank',
        acronym: 'BOS-GUY',
        url: 'https://statisticsguyana.gov.gy/',
        datasetName: 'Guyana Labor Force Survey & Living Conditions Survey',
        country: 'Guyana',
        coverage: 'Coastal and Hinterland communities',
        availablePeriods: ['2019', '2021', '2023'],
        frequency: 'anual',
        dataType: 'transversal_repetida',
        keyVariables: ['household_expenditure', 'indigenous_amerindian_status', 'mining_farming_labor'],
        license: 'Government of Guyana Open Data',
        accessRestrictions: 'Tabulados oficiales y microdatos con solicitud de investigación',
        lastUpdateDate: '2023-11-12',
        geoPrecision: 'departamental',
        limitations: 'Dispersión geográfica extrema en regiones del Hinterland accesibles solo por vía fluvial o aérea.'
      }
    ],
    climateRiskProfile: {
      droughtRisk: 'Bajo',
      floodRisk: 'Alto',
      frostRisk: 'Bajo',
      climateVulnerabilityScore: 78.5
    }
  },

  PRY: {
    code: 'PRY',
    name: 'Paraguay',
    nameEn: 'Paraguay',
    currencyCode: 'PYG',
    currencySymbol: '₲',
    exchangeRateUSD: 7650.0,
    pppFactor: 2850.0,
    povertyLineModerateUSD_PPP: 205.5,
    povertyLineExtremeUSD_PPP: 109.5,
    primaryStatisticalInstitute: 'INE Paraguay (Instituto Nacional de Estadística)',
    sampleSizeDemonstration: 390,
    ruralPopulationPct: 37.8,
    latitude: -23.4425,
    longitude: -58.4438,
    regions: ['Región Oriental (Departamentos Centrales)', 'Región Occidental (Chaco Paraguayo)'],
    officialPrograms: [
      {
        id: 'pry_tekopora',
        name: 'Programa Tekoporã Mbarete',
        acronym: 'Tekoporã',
        type: 'conditional',
        implementingAgency: 'Ministerio de Desarrollo Social (MDS)',
        targetPopulation: 'Familias en situación de pobreza y vulnerabilidad con niños y personas con discapacidad.',
        monthlyBenefitUSD_PPP: 72.0,
        conditionalityDetails: 'Asistencia escolar al 85% y cumplimiento de controles de crecimiento y desarrollo en USF.',
        officialSourceUrl: 'https://www.mds.gov.py/tekopora'
      },
      {
        id: 'pry_adultos_mayores',
        name: 'Pensión Alimentaria para Adultos Mayores',
        acronym: 'Adultos Mayores',
        type: 'non_contributory_pension',
        implementingAgency: 'MDS / Ministerio de Economía y Finanzas',
        targetPopulation: 'Adultos mayores de 65 años en situación de pobreza.',
        monthlyBenefitUSD_PPP: 95.0,
        officialSourceUrl: 'https://www.mds.gov.py/'
      }
    ],
    sources: [
      {
        institution: 'INE Paraguay',
        acronym: 'INE-PRY',
        url: 'https://www.ine.gov.py/',
        datasetName: 'Encuesta Permanente de Hogares Continua (EPHC)',
        country: 'Paraguay',
        coverage: 'Nacional, Área Urbana y Rural (excluye Alto Paraguay y Boquerón en trimestres)',
        availablePeriods: ['2017', '2018', '2019', '2020', '2021', '2022', '2023'],
        frequency: 'anual',
        dataType: 'transversal_repetida',
        keyVariables: ['ingreso_laboral_agricola', 'lengua_guarani', 'acceso_agua_corriente', 'tierra_cultivada'],
        license: 'Datos Abiertos Paraguay',
        accessRestrictions: 'Microdatos públicos con factores de expansión anual y trimestral',
        lastUpdateDate: '2024-04-12',
        geoPrecision: 'departamental',
        limitations: 'Alta prevalencia de bilingüismo guaraní-español en microdatos; medición de autoconsumo agrícola exhaustiva.'
      }
    ],
    climateRiskProfile: {
      droughtRisk: 'Alto',
      floodRisk: 'Medio',
      frostRisk: 'Medio',
      climateVulnerabilityScore: 69.3
    }
  },

  PER: {
    code: 'PER',
    name: 'Perú',
    nameEn: 'Peru',
    currencyCode: 'PEN',
    currencySymbol: 'S/',
    exchangeRateUSD: 3.75,
    pppFactor: 1.82,
    povertyLineModerateUSD_PPP: 205.5,
    povertyLineExtremeUSD_PPP: 109.5,
    primaryStatisticalInstitute: 'INEI (Instituto Nacional de Estadística e Informática)',
    sampleSizeDemonstration: 520,
    ruralPopulationPct: 20.8,
    latitude: -9.19,
    longitude: -75.0152,
    regions: ['Costa (Norte, Centro, Sur)', 'Sierra (Norte, Centro, Sur)', 'Selva (Alta y Baja)'],
    officialPrograms: [
      {
        id: 'per_juntos',
        name: 'Programa Nacional de Apoyo Directo a los Más Pobres - JUNTOS',
        acronym: 'JUNTOS',
        type: 'conditional',
        implementingAgency: 'Ministerio de Desarrollo e Inclusión Social (MIDIS)',
        targetPopulation: 'Hogares en pobreza extrema rural con gestantes y menores hasta 19 años.',
        monthlyBenefitUSD_PPP: 80.0,
        conditionalityDetails: 'Controles CRED integrales, tamizaje de anemia y asistencia escolar no menor al 85%.',
        officialSourceUrl: 'https://www.gob.pe/juntos'
      },
      {
        id: 'per_pension65',
        name: 'Programa Nacional de Asistencia Solidaria - Pensión 65',
        acronym: 'Pensión 65',
        type: 'non_contributory_pension',
        implementingAgency: 'MIDIS',
        targetPopulation: 'Adultos mayores de 65 años en pobreza extrema clasificados por el SISFOH.',
        monthlyBenefitUSD_PPP: 70.0,
        officialSourceUrl: 'https://www.gob.pe/pension65'
      }
    ],
    sources: [
      {
        institution: 'INEI',
        acronym: 'INEI',
        url: 'https://proyectos.inei.gob.pe/microdatos/',
        datasetName: 'Encuesta Nacional de Hogares (ENAHO) - Condiciones de Vida y Pobreza',
        country: 'Perú',
        coverage: 'Nacional, 24 Departamentos y Dominios Geográficos (Costa, Sierra, Selva)',
        availablePeriods: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
        frequency: 'anual',
        dataType: 'transversal_repetida',
        keyVariables: ['gasto_bruto_anual', 'linea_pobreza_monetaria', 'lengua_materna_quechua_aymara', 'piso_tierra'],
        license: 'INEI Open Science Portal',
        accessRestrictions: 'Descarga pública directa con documentación técnica completa',
        lastUpdateDate: '2024-05-09',
        geoPrecision: 'departamental',
        limitations: 'Muestra panel parcial (submuestra de rotación del 20%) y corte transversal representativo anual.'
      }
    ],
    climateRiskProfile: {
      droughtRisk: 'Alto',
      floodRisk: 'Alto',
      frostRisk: 'Alto',
      climateVulnerabilityScore: 84.7
    }
  },

  SUR: {
    code: 'SUR',
    name: 'Surinam',
    nameEn: 'Suriname',
    currencyCode: 'SRD',
    currencySymbol: '$',
    exchangeRateUSD: 36.5,
    pppFactor: 11.2,
    povertyLineModerateUSD_PPP: 205.5,
    povertyLineExtremeUSD_PPP: 109.5,
    primaryStatisticalInstitute: 'Algemeen Bureau voor de Statistiek (ABS)',
    sampleSizeDemonstration: 300,
    ruralPopulationPct: 34.0,
    latitude: 3.9193,
    longitude: -56.0278,
    regions: ['Coastal Districts (Wanica, Commewijne, Saramacca, Nickerie)', 'Interior Districts (Sipaliwini, Brokopondo)'],
    officialPrograms: [
      {
        id: 'sur_akb',
        name: 'Algemene Kinderbijslag (General Child Benefit)',
        acronym: 'AKB',
        type: 'unconditional',
        implementingAgency: 'Ministry of Social Affairs and Public Housing (SOZAVO)',
        targetPopulation: 'Families with dependent children up to 18 years living in Suriname.',
        monthlyBenefitUSD_PPP: 45.0,
        officialSourceUrl: 'https://gov.sr/ministeries/ministerie-van-sociale-zaken-en-volkshuisvesting/'
      },
      {
        id: 'sur_aov',
        name: 'Algemene Oudedagsvoorziening (General Old Age Pension)',
        acronym: 'AOV',
        type: 'non_contributory_pension',
        implementingAgency: 'AOV Fund / SOZAVO',
        targetPopulation: 'Residents aged 60 and above.',
        monthlyBenefitUSD_PPP: 110.0,
        officialSourceUrl: 'https://gov.sr/'
      }
    ],
    sources: [
      {
        institution: 'Algemeen Bureau voor de Statistiek (ABS)',
        acronym: 'ABS-SUR',
        url: 'https://statistics-suriname.org/',
        datasetName: 'Household Budget Survey (HBS) & Multi-Indicator Cluster Survey (MICS)',
        country: 'Surinam',
        coverage: 'Districts of Suriname, including tribal Maroon and Indigenous interior villages',
        availablePeriods: ['2016', '2019', '2022'],
        frequency: 'bianual',
        dataType: 'transversal_repetida',
        keyVariables: ['household_consumption', 'energy_access', 'bauxite_gold_subsistence_farming'],
        license: 'Republic of Suriname Official Data',
        accessRestrictions: 'Tabulados oficiales y microdatos previa suscripción institucional',
        lastUpdateDate: '2023-09-30',
        geoPrecision: 'departamental',
        limitations: 'Inflación reciente y fluctuaciones en la paridad SRD/USD demandan ajustes metodológicos constantes.'
      }
    ],
    climateRiskProfile: {
      droughtRisk: 'Bajo',
      floodRisk: 'Alto',
      frostRisk: 'Bajo',
      climateVulnerabilityScore: 72.3
    }
  },

  URY: {
    code: 'URY',
    name: 'Uruguay',
    nameEn: 'Uruguay',
    currencyCode: 'UYU',
    currencySymbol: '$',
    exchangeRateUSD: 41.5,
    pppFactor: 28.5,
    povertyLineModerateUSD_PPP: 205.5,
    povertyLineExtremeUSD_PPP: 109.5,
    primaryStatisticalInstitute: 'INE Uruguay (Instituto Nacional de Estadística)',
    sampleSizeDemonstration: 360,
    ruralPopulationPct: 4.5,
    latitude: -32.5228,
    longitude: -55.7658,
    regions: ['Interior Norte (Artigas, Rivera, Tacuarembó)', 'Interior Este/Oeste', 'Área Metropolitana'],
    officialPrograms: [
      {
        id: 'ury_afam',
        name: 'Asignaciones Familiares - Plan de Equidad',
        acronym: 'AFAM-PE',
        type: 'conditional',
        implementingAgency: 'BPS (Banco de Previsión Social) / MIDES',
        targetPopulation: 'Hogares en situación de vulnerabilidad socioeconómica con menores a cargo.',
        monthlyBenefitUSD_PPP: 95.0,
        conditionalityDetails: 'Controles en sistema de salud infantil y concurrencia regular a enseñanza formal.',
        officialSourceUrl: 'https://www.bps.gub.uy/'
      },
      {
        id: 'ury_tus',
        name: 'Tarjeta Uruguay Social',
        acronym: 'TUS',
        type: 'food_stamp',
        implementingAgency: 'MIDES (Ministerio de Desarrollo Social)',
        targetPopulation: 'Hogares en el decil inferior de condiciones socioeconómicas (ICSE).',
        monthlyBenefitUSD_PPP: 78.0,
        officialSourceUrl: 'https://www.gub.uy/ministerio-desarrollo-social/'
      }
    ],
    sources: [
      {
        institution: 'INE Uruguay',
        acronym: 'INE-URY',
        url: 'https://www.ine.gub.uy/',
        datasetName: 'Encuesta Continua de Hogares (ECH)',
        country: 'Uruguay',
        coverage: 'Nacional Urbano y Localidades Rurales / Población Rural Dispersa',
        availablePeriods: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
        frequency: 'mensual',
        dataType: 'panel',
        keyVariables: ['ingreso_disponible_percapita', 'linea_pobreza_cba', 'aportes_seguridad_social'],
        license: 'Licencia Abierta de Datos de Gobierno Digital AGESIC',
        accessRestrictions: 'Microdatos descargables en CSV y R con diccionarios de variables',
        lastUpdateDate: '2024-09-10',
        geoPrecision: 'departamental',
        limitations: 'Baja tasa relativa de pobreza extrema rural; los estratos se concentran en peones rurales y productores familiares.'
      }
    ],
    climateRiskProfile: {
      droughtRisk: 'Alto',
      floodRisk: 'Medio',
      frostRisk: 'Medio',
      climateVulnerabilityScore: 48.9
    }
  },

  VEN: {
    code: 'VEN',
    name: 'Venezuela',
    nameEn: 'Venezuela',
    currencyCode: 'VES',
    currencySymbol: 'Bs.',
    exchangeRateUSD: 39.5,
    pppFactor: 8.5,
    povertyLineModerateUSD_PPP: 205.5,
    povertyLineExtremeUSD_PPP: 109.5,
    primaryStatisticalInstitute: 'INE Venezuela / Proyecto ENCOVI (UCAB)',
    sampleSizeDemonstration: 440,
    ruralPopulationPct: 11.8,
    latitude: 6.4238,
    longitude: -66.5897,
    regions: ['Andina (Mérida, Táchira, Trujillo)', 'Llanos (Barinas, Portuguesa, Apure)', 'Guayana/Amazonas', 'Costa Montaña'],
    officialPrograms: [
      {
        id: 'ven_patria',
        name: 'Sistema Patria - Bonos Protectores de la Patria',
        acronym: 'Hogares de la Patria',
        type: 'unconditional',
        implementingAgency: 'Vicepresidencia de la República / Plataforma Patria',
        targetPopulation: 'Familias carnetizadas registradas en la plataforma digital Patria.',
        monthlyBenefitUSD_PPP: 35.0,
        officialSourceUrl: 'https://patria.org.ve/'
      }
    ],
    sources: [
      {
        institution: 'Instituto de Investigaciones Económicas y Sociales (IIES) - UCAB',
        acronym: 'ENCOVI',
        url: 'https://www.proyectoencovi.com/',
        datasetName: 'Encuesta Nacional de Condiciones de Vida (ENCOVI)',
        country: 'Venezuela',
        coverage: 'Nacional representativo, estratos urbanos y rurales',
        availablePeriods: ['2018', '2019', '2020', '2021', '2022', '2023'],
        frequency: 'anual',
        dataType: 'transversal_repetida',
        keyVariables: ['consumo_calorico_diario', 'remesas_internacionales', 'claf_cesta_basica', 'migracion_hogar'],
        license: 'Acceso Académico Abierto UCAB',
        accessRestrictions: 'Informes y bases procesadas con fines científicos',
        lastUpdateDate: '2024-03-22',
        geoPrecision: 'departamental',
        limitations: 'Discontinuidad de estadísticas del INE oficial; ENCOVI constituye la referencia empírica principal internacionalmente.'
      }
    ],
    climateRiskProfile: {
      droughtRisk: 'Medio',
      floodRisk: 'Alto',
      frostRisk: 'Bajo',
      climateVulnerabilityScore: 88.4
    }
  },

  GUF: {
    code: 'GUF',
    name: 'Guayana Francesa (Territorio Ultraperiférico)',
    nameEn: 'French Guiana (Outermost Region)',
    currencyCode: 'EUR',
    currencySymbol: '€',
    exchangeRateUSD: 0.92,
    pppFactor: 0.88,
    povertyLineModerateUSD_PPP: 350.0,
    povertyLineExtremeUSD_PPP: 180.0,
    primaryStatisticalInstitute: 'INSEE France (Institut National de la Statistique et des Études Économiques)',
    sampleSizeDemonstration: 260,
    ruralPopulationPct: 15.0,
    latitude: 3.9339,
    longitude: -53.1258,
    regions: ['Littoral Guyanais', 'Communes de l\'Intérieur (Maroni, Oyapock)'],
    officialPrograms: [
      {
        id: 'guf_rsa',
        name: 'Revenu de Solidarité Active',
        acronym: 'RSA',
        type: 'conditional',
        implementingAgency: 'Caisse d\'Allocations Familiales (CAF Guyane)',
        targetPopulation: 'Personas de más de 25 años o con hijos a cargo con recursos inferiores al baremo garantizado.',
        monthlyBenefitUSD_PPP: 450.0,
        conditionalityDetails: 'Contrat d\'engagement réciproque vers l\'insertion professionnelle ou sociale.',
        officialSourceUrl: 'https://www.caf.fr/allocataires/caf-de-la-guyane'
      }
    ],
    sources: [
      {
        institution: 'INSEE France',
        acronym: 'INSEE',
        url: 'https://www.insee.fr/fr/statistiques?geo=DEP-973',
        datasetName: 'Dispositif sur les Revenus Localisés et Fiscaux (Filosofi Guyane)',
        country: 'Guayana Francesa',
        coverage: 'Département et communes d\'outre-mer',
        availablePeriods: ['2018', '2019', '2020', '2021', '2022'],
        frequency: 'anual',
        dataType: 'administrativo',
        keyVariables: ['revenu_disponible_ajuste', 'taux_de_pauvrete_60pct', 'prestations_sociales'],
        license: 'Licence Ouverte / Open Licence v2.0',
        accessRestrictions: 'Données publiques INSEE',
        lastUpdateDate: '2024-04-18',
        geoPrecision: 'municipal',
        limitations: 'Territorio francés regido por el código de seguridad social europeo, con marcadas disparidades entre la costa y el interior fluvial.'
      }
    ],
    climateRiskProfile: {
      droughtRisk: 'Bajo',
      floodRisk: 'Alto',
      frostRisk: 'Bajo',
      climateVulnerabilityScore: 52.0
    }
  }
};
