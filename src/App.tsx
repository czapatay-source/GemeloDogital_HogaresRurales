/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  CountryCode,
  CrispDmPhase,
  HouseholdAgent,
  MLModelExperiment,
  SimulationResult
} from './types';
import { COUNTRIES_DATA } from './data/countries';
import { generateSyntheticHouseholds } from './data/syntheticGenerator';
import { DEFAULT_POLICIES, DEFAULT_SHOCKS, runPolicySimulation } from './engine/simulationEngine';

// Components
import { DigitalTwin3D } from './components/DigitalTwin3D';
import { CrispDmFlow } from './components/CrispDmFlow';
import { DataCatalog } from './components/DataCatalog';
import { DatasetStudio } from './components/DatasetStudio';
import { DataPreparation } from './components/DataPreparation';
import { ExploratoryAnalysis } from './components/ExploratoryAnalysis';
import { PolicyLab } from './components/PolicyLab';
import { ModelTraining } from './components/ModelTraining';
import { HyperparameterTuning } from './components/HyperparameterTuning';
import { ModelComparison } from './components/ModelComparison';
import { StatisticalValidation } from './components/StatisticalValidation';
import { SyncMonitor } from './components/SyncMonitor';
import { AiAssistant } from './components/AiAssistant';
import { LangflowStudio } from './components/LangflowStudio';
import { ReportExporter } from './components/ReportExporter';
import { AdminAudit } from './components/AdminAudit';
import { BUILTIN_DATASETS, DatasetMetadata } from './data/masterDataset';

import {
  Globe,
  Sliders,
  Database,
  BarChart2,
  Cpu,
  CheckCircle,
  Activity,
  Bot,
  Workflow,
  FileText,
  Shield,
  Layers,
  Moon,
  Sun,
  Languages,
  RotateCcw
} from 'lucide-react';

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('PER');
  const [activeTab, setActiveTab] = useState<string>('twin_3d');
  const [crispDmPhase, setCrispDmPhase] = useState<CrispDmPhase>('modeling');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [selectedHousehold, setSelectedHousehold] = useState<HouseholdAgent | null>(null);

  // Household microdata initialized for selected country
  const [householdsData, setHouseholdsData] = useState<Record<CountryCode, HouseholdAgent[]>>(() => {
    const initial: Partial<Record<CountryCode, HouseholdAgent[]>> = {};
    (Object.keys(COUNTRIES_DATA) as CountryCode[]).forEach((code) => {
      initial[code] = generateSyntheticHouseholds(code, COUNTRIES_DATA[code].sampleSizeDemonstration, 2026);
    });
    return initial as Record<CountryCode, HouseholdAgent[]>;
  });

  const currentHouseholds = householdsData[selectedCountry] || [];

  // Active simulation result
  const [simulationResult, setSimulationResult] = useState<SimulationResult>(() => {
    const initialHh = generateSyntheticHouseholds('PER', COUNTRIES_DATA['PER'].sampleSizeDemonstration, 2026);
    return runPolicySimulation(
      initialHh,
      'PER',
      DEFAULT_POLICIES.cct_education_priority,
      DEFAULT_SHOCKS.severe_drought
    );
  });

  // Trained ML models
  const [trainedModels, setTrainedModels] = useState<MLModelExperiment[]>([]);
  const [activeModel, setActiveModel] = useState<MLModelExperiment | null>(null);

  // Active Dataset Meta
  const [activeDatasetMeta, setActiveDatasetMeta] = useState<DatasetMetadata>(BUILTIN_DATASETS[0]);

  // Switch country handler
  const handleSelectCountry = (code: CountryCode) => {
    setSelectedCountry(code);
    setSelectedHousehold(null);
    let hh = householdsData[code];
    if (!hh || hh.length === 0) {
      hh = generateSyntheticHouseholds(code, COUNTRIES_DATA[code].sampleSizeDemonstration, 2026);
      setHouseholdsData((prev) => ({ ...prev, [code]: hh }));
    }
    const res = runPolicySimulation(
      hh,
      code,
      simulationResult.policy,
      simulationResult.shock
    );
    setSimulationResult(res);
  };

  const handleSetActiveHouseholds = (hh: HouseholdAgent[], meta: DatasetMetadata) => {
    setActiveDatasetMeta(meta);
    if (meta.countryCode && meta.countryCode !== 'ALL') {
      setSelectedCountry(meta.countryCode);
    }
    setHouseholdsData((prev) => ({ ...prev, [selectedCountry]: hh }));
    const res = runPolicySimulation(
      hh,
      selectedCountry,
      simulationResult.policy,
      simulationResult.shock
    );
    setSimulationResult(res);
  };

  const handleApplyTransformation = (updated: HouseholdAgent[]) => {
    setHouseholdsData((prev) => ({ ...prev, [selectedCountry]: updated }));
    const res = runPolicySimulation(
      updated,
      selectedCountry,
      simulationResult.policy,
      simulationResult.shock
    );
    setSimulationResult(res);
  };

  const handleModelTrained = (model: MLModelExperiment) => {
    setTrainedModels((prev) => [model, ...prev]);
    setActiveModel(model);
  };

  const countryInfo = COUNTRIES_DATA[selectedCountry];

  return (
    <div className={isDarkMode ? 'dark bg-slate-950 text-slate-100 min-h-screen' : 'bg-slate-50 text-slate-900 min-h-screen'}>
      {/* Universal Top Bar Contract (1 row, 3 zones separated by gap-8) */}
      <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-3.5 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        {/* Zone 1: Brand title, one line wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base">
            Gemelo Digital de Hogares Rurales
          </span>
          <span className="text-slate-400 font-mono text-xs hidden lg:inline">Sudamérica</span>
        </div>

        {/* Zone 2: 4-5 nav links, 1-2 word labels, single line */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('twin_3d')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              activeTab === 'twin_3d' ? 'border-cyan-500 text-slate-900 dark:text-white font-semibold' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gemelo 3D
          </button>
          <button
            onClick={() => setActiveTab('dataset_studio')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              activeTab === 'dataset_studio' ? 'border-cyan-500 text-slate-900 dark:text-white font-semibold' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gestor de Datasets
          </button>
          <button
            onClick={() => setActiveTab('policy_lab')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              activeTab === 'policy_lab' ? 'border-cyan-500 text-slate-900 dark:text-white font-semibold' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Políticas & Choques
          </button>
          <button
            onClick={() => setActiveTab('crisp_dm')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              activeTab === 'crisp_dm' ? 'border-cyan-500 text-slate-900 dark:text-white font-semibold' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            CRISP-DM
          </button>
          <button
            onClick={() => setActiveTab('statistical_tests')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              activeTab === 'statistical_tests' ? 'border-cyan-500 text-slate-900 dark:text-white font-semibold' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Validación & ML
          </button>
        </nav>

        {/* Zone 3: 1 primary action lockup */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Country Selector */}
          <select
            value={selectedCountry}
            onChange={(e) => handleSelectCountry(e.target.value as CountryCode)}
            className="text-xs font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
          >
            {(Object.keys(COUNTRIES_DATA) as CountryCode[]).map((c) => (
              <option key={c} value={c}>
                {COUNTRIES_DATA[c].name} ({c})
              </option>
            ))}
          </select>

          {/* Theme Switch */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="px-2 py-1 text-xs font-mono font-semibold rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {language.toUpperCase()}
          </button>
        </div>
      </header>

      {/* Secondary Context Navigation Toolbar */}
      <div className="bg-slate-100/90 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-6 py-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max text-xs">
          {[
            { id: 'twin_3d', label: 'Gemelo 3D' },
            { id: 'dataset_studio', label: 'Gestor de Datasets' },
            { id: 'policy_lab', label: 'Laboratorio de Políticas' },
            { id: 'crisp_dm', label: 'Metodología CRISP-DM' },
            { id: 'catalog', label: 'Catálogo Oficial' },
            { id: 'preparation', label: 'Preparación de Datos' },
            { id: 'eda', label: 'Análisis EDA' },
            { id: 'ml_models', label: 'Modelos ML' },
            { id: 'optuna', label: 'Optuna TPE' },
            { id: 'model_comparison', label: 'Gobernanza Modelos' },
            { id: 'statistical_tests', label: 'Pruebas Estadísticas' },
            { id: 'sync', label: 'Sincronización' },
            { id: 'assistant', label: 'Asistente LangChain' },
            { id: 'langflow', label: 'Flujos Langflow' },
            { id: 'reports', label: 'Informes & Hashes' },
            { id: 'admin', label: 'Auditoría & RBAC' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'twin_3d' && (
          <div className="space-y-6">
            <DigitalTwin3D
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
              households={currentHouseholds}
              activeShockType={simulationResult.shock.type}
              transferDisbursed={simulationResult.simulated.beneficiaryHouseholdsCount > 0}
              selectedHousehold={selectedHousehold}
              onSelectHousehold={setSelectedHousehold}
              datasetName={activeDatasetMeta.name}
            />

            {/* Quick Context Summary Below 3D Viewport */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  País Seleccionado
                </span>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {countryInfo.name} ({countryInfo.code})
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Población Rural: {countryInfo.ruralPopulationPct}%
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Línea Pobreza Moderada
                </span>
                <div className="text-lg font-mono font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 tabular-nums">
                  ${countryInfo.povertyLineModerateUSD_PPP} USD PPP
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Moneda: {countryInfo.currencyCode} (PPP {countryInfo.pppFactor})
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Reducción P0 Simulada
                </span>
                <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                  -{simulationResult.delta.povertyReductionPctPoints} pp
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Tasa Simulada: {simulationResult.simulated.fgt0_headcount}%
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Vulnerabilidad Climática
                </span>
                <div className="text-lg font-mono font-bold text-amber-500 mt-0.5 tabular-nums">
                  {countryInfo.climateRiskProfile.climateVulnerabilityScore}/100
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Riesgo Sequía: {countryInfo.climateRiskProfile.droughtRisk}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'policy_lab' && (
          <PolicyLab
            selectedCountry={selectedCountry}
            households={currentHouseholds}
            simulationResult={simulationResult}
            onRunSimulation={setSimulationResult}
          />
        )}

        {activeTab === 'crisp_dm' && (
          <CrispDmFlow
            currentPhase={crispDmPhase}
            onSelectPhase={setCrispDmPhase}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'dataset_studio' && (
          <DatasetStudio
            selectedCountry={selectedCountry}
            onSelectCountry={handleSelectCountry}
            activeHouseholds={currentHouseholds}
            onSetActiveHouseholds={handleSetActiveHouseholds}
            activeDatasetId={activeDatasetMeta.id}
          />
        )}

        {activeTab === 'catalog' && (
          <DataCatalog
            selectedCountry={selectedCountry}
            onSelectCountry={handleSelectCountry}
            onCustomDataUploaded={(fileName, count) => {
              // Custom microdata uploaded
            }}
          />
        )}

        {activeTab === 'preparation' && (
          <DataPreparation
            selectedCountry={selectedCountry}
            households={currentHouseholds}
            onApplyTransformation={handleApplyTransformation}
          />
        )}

        {activeTab === 'eda' && (
          <ExploratoryAnalysis
            selectedCountry={selectedCountry}
            households={currentHouseholds}
          />
        )}

        {activeTab === 'ml_models' && (
          <ModelTraining
            households={currentHouseholds}
            onModelTrained={handleModelTrained}
            activeModel={activeModel}
          />
        )}

        {activeTab === 'optuna' && <HyperparameterTuning />}

        {activeTab === 'model_comparison' && (
          <ModelComparison
            models={trainedModels}
            onPublishModel={(id) => {}}
          />
        )}

        {activeTab === 'statistical_tests' && (
          <StatisticalValidation
            households={currentHouseholds}
            povertyLine={countryInfo.povertyLineModerateUSD_PPP}
          />
        )}

        {activeTab === 'sync' && <SyncMonitor selectedCountry={selectedCountry} />}

        {activeTab === 'assistant' && (
          <AiAssistant
            selectedCountry={selectedCountry}
            households={currentHouseholds}
            simulationResult={simulationResult}
          />
        )}

        {activeTab === 'langflow' && <LangflowStudio />}

        {activeTab === 'reports' && (
          <ReportExporter
            selectedCountry={selectedCountry}
            households={currentHouseholds}
            simulationResult={simulationResult}
          />
        )}

        {activeTab === 'admin' && <AdminAudit />}
      </main>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-6 mt-12 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>Gemelo Digital de Hogares Rurales de Sudamérica</span>
          <span className="mx-2">·</span>
          <span>12 Países Soberanos + Guayana Francesa</span>
          <span className="mx-2">·</span>
          <span>Metodología CRISP-DM</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          INDEC · IBGE · DANE · INEI · INE · CASEN · ENEMDU · CHIRPS · ERA5
        </div>
      </footer>
    </div>
  );
}
