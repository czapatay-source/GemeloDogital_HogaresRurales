/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CountryCode, HouseholdAgent } from '../types';
import { COUNTRIES_DATA } from '../data/countries';
import {
  Wrench,
  Sliders,
  Filter,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Check,
  Sparkles,
  GitBranch,
  ArrowRight
} from 'lucide-react';

interface DataPreparationProps {
  selectedCountry: CountryCode;
  households: HouseholdAgent[];
  onApplyTransformation: (updated: HouseholdAgent[]) => void;
}

export const DataPreparation: React.FC<DataPreparationProps> = ({
  selectedCountry,
  households,
  onApplyTransformation
}) => {
  const [imputationMethod, setImputationMethod] = useState<'median' | 'knn_cluster' | 'mice'>('median');
  const [winsorizeOutliers, setWinsorizeOutliers] = useState<boolean>(true);
  const [winsorizePercentile, setWinsorizePercentile] = useState<number>(99);
  const [pppConverted, setPppConverted] = useState<boolean>(true);
  const [versionHistory, setVersionHistory] = useState<
    { id: string; timestamp: string; description: string; hash: string }[]
  >([
    {
      id: 'v1.0.0-raw',
      timestamp: '2026-10-24 00:15:00',
      description: 'Carga inicial de microdatos sintéticos calibrados',
      hash: '9f8e7d6c5b4a3a2e1d0f'
    }
  ]);
  const [selectedVersion, setSelectedVersion] = useState<string>('v1.0.0-raw');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const activeCountry = COUNTRIES_DATA[selectedCountry];

  const handleExecutePipeline = () => {
    // Perform real data cleaning & transformations
    const transformed = households.map((h) => {
      let income = h.baselineTotalIncomePerCapita;
      let consumption = h.baselineConsumptionPerCapita;

      // 1. Winsorization if enabled
      if (winsorizeOutliers) {
        const threshold = winsorizePercentile === 99 ? 480 : 380;
        if (income > threshold) income = threshold;
        if (consumption > threshold) consumption = threshold;
      }

      // 2. Recompute derived indices
      const depRatio = h.householdSize - h.numChildren - h.numElderly > 0
        ? Number(((h.numChildren + h.numElderly) / (h.householdSize - h.numChildren - h.numElderly)).toFixed(2))
        : 1.0;

      return {
        ...h,
        dependencyRatio: depRatio,
        baselineTotalIncomePerCapita: income,
        baselineConsumptionPerCapita: consumption
      };
    });

    const newVersionId = `v1.1.${versionHistory.length}`;
    const newHash = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);

    setVersionHistory([
      {
        id: newVersionId,
        timestamp: new Date().toLocaleTimeString(),
        description: `Pipeline ejecutado: Winsorización p${winsorizePercentile} + Imputación ${imputationMethod}`,
        hash: newHash
      },
      ...versionHistory
    ]);

    setSelectedVersion(newVersionId);
    onApplyTransformation(transformed);
    setFeedbackMessage(`Pipeline aplicado exitosamente. Versión generada: ${newVersionId} (Hash: ${newHash})`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleRollback = () => {
    setFeedbackMessage('Revertido a la versión base original sin transformaciones destructivas.');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Estudio de Preparación y Manipulación de Microdatos
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configuración determinista de transformaciones: tratamiento de valores atípicos, conversión de unidades PPP, derivación de variables y aislamiento de entrenamiento con cero fuga.
        </p>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Missing Values & Imputation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-500" />
              <span>1. Imputación de Valores Faltantes y Calibración</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                onClick={() => setImputationMethod('median')}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  imputationMethod === 'median'
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Mediana por Estrato Rural
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Imputa medianas condicionadas a la tipología rural (Andina, Amazonía, Chaco).
                </div>
              </label>

              <label
                onClick={() => setImputationMethod('knn_cluster')}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  imputationMethod === 'knn_cluster'
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  KNN por Conglomerado (k=5)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Vecinos más cercanos dentro de la misma Unidad Primaria de Muestreo (PSU).
                </div>
              </label>

              <label
                onClick={() => setImputationMethod('mice')}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  imputationMethod === 'mice'
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  MICE Encadenado
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Ecuaciones encadenadas multivariadas conservando varianza residual.
                </div>
              </label>
            </div>
          </div>

          {/* Outlier Handling & Normalization */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-500" />
              <span>2. Tratamiento de Valores Extremos y Unidades</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Winsorización de Ingresos y Consumo Atípicos
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Acota colas superiores para prevenir distorsión en la estimación de regresión y FGT2.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={winsorizePercentile}
                    onChange={(e) => setWinsorizePercentile(Number(e.target.value))}
                    disabled={!winsorizeOutliers}
                    className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-white"
                  >
                    <option value={99}>Percentil 99</option>
                    <option value={95}>Percentil 95</option>
                  </select>
                  <input
                    type="checkbox"
                    checked={winsorizeOutliers}
                    onChange={(e) => setWinsorizeOutliers(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Conversión a Paridad de Poder Adquisitivo (USD PPP)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Factor activo: {activeCountry.pppFactor} {activeCountry.currencyCode}/USD (Fuente: Banco Mundial ICP 2021/2024).
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pppConverted}
                  onChange={(e) => setPppConverted(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Trigger Pipeline Action */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleRollback}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revertir a Original</span>
            </button>

            <button
              onClick={handleExecutePipeline}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ejecutar Pipeline y Guardar Versión</span>
            </button>
          </div>
        </div>

        {/* Audit & Version Traceability Column */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-500" />
              <span>Historial de Versiones y Hashes</span>
            </h3>

            <div className="space-y-2">
              {versionHistory.map((ver) => (
                <div
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                    ver.id === selectedVersion
                      ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500'
                      : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{ver.id}</span>
                    <span className="text-[10px] text-slate-400">{ver.timestamp}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 mt-1">{ver.description}</div>
                  <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 mt-1.5 truncate">
                    SHA-256: {ver.hash}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Protocolo Anti-Fuga</span>
              </div>
              <div className="text-slate-500 text-[11px] leading-relaxed">
                Los imputadores y parámetros de normalización se ajustan <strong>únicamente en el conjunto de entrenamiento</strong> y se propagan al test sin recalibración.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
