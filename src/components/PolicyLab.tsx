/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ClimateShockEvent,
  CountryCode,
  HouseholdAgent,
  PolicySpecification,
  SimulationResult
} from '../types';
import { COUNTRIES_DATA } from '../data/countries';
import {
  DEFAULT_POLICIES,
  DEFAULT_SHOCKS,
  runPolicySimulation
} from '../engine/simulationEngine';
import {
  Sliders,
  DollarSign,
  TrendingDown,
  ShieldAlert,
  Layers,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  Scale,
  Award,
  Zap,
  Info
} from 'lucide-react';

interface PolicyLabProps {
  selectedCountry: CountryCode;
  households: HouseholdAgent[];
  simulationResult: SimulationResult;
  onRunSimulation: (result: SimulationResult) => void;
}

export const PolicyLab: React.FC<PolicyLabProps> = ({
  selectedCountry,
  households,
  simulationResult,
  onRunSimulation
}) => {
  const activeCountry = COUNTRIES_DATA[selectedCountry];

  // Active policy editor state
  const [policyType, setPolicyType] = useState<PolicySpecification['type']>('conditional');
  const [baseAmountUSD_PPP, setBaseAmountUSD_PPP] = useState<number>(75);
  const [childSupplement, setChildSupplement] = useState<number>(25);
  const [elderlySupplement, setElderlySupplement] = useState<number>(35);
  const [targetCriterion, setTargetCriterion] = useState<PolicySpecification['targetCriterion']>('children_households');
  const [enforceSchoolAttendance, setEnforceSchoolAttendance] = useState<boolean>(true);
  const [minAttendancePct, setMinAttendancePct] = useState<number>(85);
  const [adminCostPct, setAdminCostPct] = useState<number>(4.8);
  const [microcreditLoan, setMicrocreditLoan] = useState<number>(0);
  const [agriculturalTraining, setAgriculturalTraining] = useState<boolean>(false);
  const [weatherInsurance, setWeatherInsurance] = useState<boolean>(false);
  const [durationMonths, setDurationMonths] = useState<number>(12);

  // Climate shock selector
  const [selectedShockKey, setSelectedShockKey] = useState<string>('none');

  // Iso-Budget Mode toggle
  const [isoBudgetMode, setIsoBudgetMode] = useState<boolean>(false);

  // Re-run simulation handler
  const handleExecuteSimulation = () => {
    const policy: PolicySpecification = {
      id: `pol_custom_${Date.now()}`,
      name: `Política Personalizada (${policyType.toUpperCase()})`,
      type: policyType,
      description: `Transferencia ${policyType} con base $${baseAmountUSD_PPP} USD PPP para ${targetCriterion}.`,
      baseAmountUSD_PPP,
      childSupplementUSD_PPP: childSupplement,
      elderlySupplementUSD_PPP: elderlySupplement,
      targetCriterion,
      conditionalities: {
        enforceSchoolAttendance,
        minAttendancePct,
        enforceHealthControls: enforceSchoolAttendance
      },
      administrativeCostPct: adminCostPct,
      complementaryPackages: {
        microcreditLoanUSD_PPP: microcreditLoan,
        agriculturalTraining,
        weatherIndexInsurance: weatherInsurance
      },
      durationMonths
    };

    const shock: ClimateShockEvent = DEFAULT_SHOCKS[selectedShockKey] || DEFAULT_SHOCKS.none;

    const result = runPolicySimulation(households, selectedCountry, policy, shock);
    onRunSimulation(result);
  };

  const applyPresetPolicy = (presetKey: string) => {
    const p = DEFAULT_POLICIES[presetKey];
    if (!p) return;
    setPolicyType(p.type);
    setBaseAmountUSD_PPP(p.baseAmountUSD_PPP);
    setChildSupplement(p.childSupplementUSD_PPP);
    setElderlySupplement(p.elderlySupplementUSD_PPP);
    setTargetCriterion(p.targetCriterion);
    setEnforceSchoolAttendance(p.conditionalities.enforceSchoolAttendance);
    setMinAttendancePct(p.conditionalities.minAttendancePct);
    setAdminCostPct(p.administrativeCostPct);
    setMicrocreditLoan(p.complementaryPackages.microcreditLoanUSD_PPP);
    setAgriculturalTraining(p.complementaryPackages.agriculturalTraining);
    setWeatherInsurance(p.complementaryPackages.weatherIndexInsurance);
    setDurationMonths(p.durationMonths);
  };

  const sim = simulationResult.simulated;
  const base = simulationResult.baseline;
  const delta = simulationResult.delta;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Laboratorio de Políticas de Transferencias y Choques Climáticos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulador de microsimulación de agentes para {activeCountry.name}. Contrasta transferencias condicionadas (CCT), incondicionadas (UCT), paquetes productivos y resiliencia ante sequías o inundaciones.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Plantillas:</span>
          <button
            onClick={() => applyPresetPolicy('cct_education_priority')}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors text-slate-700 dark:text-slate-200 whitespace-nowrap"
          >
            CCT Educación
          </button>
          <button
            onClick={() => applyPresetPolicy('uct_unconditional_safety_net')}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors text-slate-700 dark:text-slate-200 whitespace-nowrap"
          >
            UCT Renta
          </button>
          <button
            onClick={() => applyPresetPolicy('resilience_climate_bundle')}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors text-slate-700 dark:text-slate-200 whitespace-nowrap"
          >
            Paquete Climático
          </button>
        </div>
      </div>

      {/* Main Split Console: Left Controls, Right Econometric Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-500" />
              <span>Diseño del Esquema de Transferencia</span>
            </h3>

            {/* Policy Type Switch */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Tipo de Transferencia
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setPolicyType('conditional');
                    setEnforceSchoolAttendance(true);
                  }}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    policyType === 'conditional'
                      ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Condicionada (CCT)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPolicyType('unconditional');
                    setEnforceSchoolAttendance(false);
                  }}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    policyType === 'unconditional'
                      ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Incondicionada (UCT)
                </button>
                <button
                  type="button"
                  onClick={() => setPolicyType('asset_bundled')}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    policyType === 'asset_bundled'
                      ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Graduación / Bundled
                </button>
              </div>
            </div>

            {/* Target Criteria */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Focalización / Grupo Objetivo
              </label>
              <select
                value={targetCriterion}
                onChange={(e) => setTargetCriterion(e.target.value as PolicySpecification['targetCriterion'])}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="children_households">Hogares vulnerables con menores de 18 años</option>
                <option value="extreme_poor_only">Pobreza Extrema únicamente (Focalización estricta)</option>
                <option value="moderate_and_extreme">Pobreza Moderada y Extrema</option>
                <option value="female_headed_only">Hogares vulnerables con jefatura femenina</option>
                <option value="climate_exposed_only">Hogares en alta exposición agroclimática</option>
                <option value="universal_rural">Cobertura Rural Universal (Sin exclusiones)</option>
              </select>
            </div>

            {/* Transfer Amounts */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Monto Base (USD PPP)</label>
                <input
                  type="number"
                  min="0"
                  max="350"
                  value={baseAmountUSD_PPP}
                  onChange={(e) => setBaseAmountUSD_PPP(Number(e.target.value))}
                  className="w-full text-xs font-mono font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">+ Suplemento Hijo</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={childSupplement}
                  onChange={(e) => setChildSupplement(Number(e.target.value))}
                  className="w-full text-xs font-mono font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">+ Suplemento Mayor</label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={elderlySupplement}
                  onChange={(e) => setElderlySupplement(Number(e.target.value))}
                  className="w-full text-xs font-mono font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Conditionality & Admin */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300">Exigir Corresponsabilidad Escolar (&gt;=85%)</span>
                <input
                  type="checkbox"
                  checked={enforceSchoolAttendance}
                  onChange={(e) => setEnforceSchoolAttendance(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-0"
                />
              </label>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Costo Administrativo:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{adminCostPct}%</span>
              </div>
            </div>

            {/* Climate Shock Injection */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Choque Climático Concurrente
              </label>
              <select
                value={selectedShockKey}
                onChange={(e) => setSelectedShockKey(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-200"
              >
                <option value="none">Sin Choque Climático (Línea Base)</option>
                <option value="severe_drought">Sequía Hidrológica Extrema (Pérdida 45% cultivos)</option>
                <option value="riverine_flood">Inundación Fluvial y Pérdida de Pastos (Pérdida 55%)</option>
                <option value="mountain_frost">Heladas Anómalas en Altiplano/Sierra (Pérdida 50%)</option>
              </select>
            </div>

            {/* Complementary Packages */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Intervenciones Complementarias
              </label>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agriculturalTraining}
                    onChange={(e) => setAgriculturalTraining(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-0"
                  />
                  <span>Capacitación en Manejo Agroecológico y Suelos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weatherInsurance}
                    onChange={(e) => setWeatherInsurance(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-0"
                  />
                  <span>Seguro Catastrófico Indexado por Satélite (CHIRPS)</span>
                </label>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecuteSimulation}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Simular Escenario y Evaluar FGT</span>
            </button>
          </div>
        </div>

        {/* Right Column: Econometric Indicators & Policy Impact (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Impact Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-semibold">
                  Resultados Econométricos del Escenario
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {simulationResult.scenarioName}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Costo Fiscal Estimado</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  ${(sim.annualFiscalCostUSD_PPP / 1e6).toFixed(2)}M <span className="text-xs font-normal text-slate-400">USD PPP/año</span>
                </span>
              </div>
            </div>

            {/* FGT Indices Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="text-[11px] font-medium text-slate-400">P0: Incidencia Pobreza</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                    {sim.fgt0_headcount}%
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    -{delta.povertyReductionPctPoints} pp
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Base: {base.fgt0_headcount}% · IC 95%: [{simulationResult.uncertaintyIntervals.fgt0[0]}%, {simulationResult.uncertaintyIntervals.fgt0[1]}%]
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="text-[11px] font-medium text-slate-400">P1: Brecha de Pobreza</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                    {sim.fgt1_gap}%
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    -{delta.povertyGapReductionPct} pp
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Base: {base.fgt1_gap}% · Profundidad del déficit
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="text-[11px] font-medium text-slate-400">Gini de Desigualdad</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                    {sim.giniCoefficient}
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    -{delta.giniReduction}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Base: {base.giniCoefficient} · Ratio Palma: {sim.palmaRatio}
                </div>
              </div>
            </div>

            {/* Target Accuracy & Exclusion Errors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[11px]">Hogares Beneficiarios</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  {sim.beneficiaryHouseholdsCount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Cobertura Pobres</span>
                <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400 tabular-nums">
                  {sim.coverageOfPoorPct}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Error de Exclusión</span>
                <span className="font-mono font-semibold text-amber-500 tabular-nums">
                  {sim.exclusionErrorPct}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Multiplicador Fiscal</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {sim.fiscalMultiplierEstimate}x
                </span>
              </div>
            </div>
          </div>

          {/* Poverty Reduction by Typology Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Efecto Heterogéneo por Tipología Rural
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-mono">
                  <tr>
                    <th className="py-2 px-3">Tipología</th>
                    <th className="py-2 px-3 text-right">Línea Base FGT0</th>
                    <th className="py-2 px-3 text-right">Simulada FGT0</th>
                    <th className="py-2 px-3 text-right">Variación Neta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {simulationResult.povertyByTypology.map((t) => (
                    <tr key={t.typology} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{t.typology}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">{t.baselineFGT0}%</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">{t.simulatedFGT0}%</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                        {t.change > 0 ? `+${t.change}` : t.change} pp
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Methodological Caveat & Policy Recommendation */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-500" />
              <span>Interpretación para la Toma de Decisión Pública</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              La política evaluada genera una reducción estimada de <strong>{delta.povertyReductionPctPoints} puntos porcentuales</strong> en la tasa de pobreza rural para {activeCountry.name}. Cada punto porcentual de pobreza mitigado demandó aproximadamente <strong>${delta.costPerPovertyPointReduced.toLocaleString()} USD PPP</strong>. La inclusión de transferencias condicionadas refuerza la asistencia escolar hasta el <strong>{sim.childSchoolAttendancePct}%</strong>, amortiguando la venta forzada de activos ante eventos climáticos adversos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
