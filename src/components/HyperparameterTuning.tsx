/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OptunaStudyResult, runOptunaOptimization } from '../engine/optunaSimulation';
import {
  Sparkles,
  Play,
  RotateCw,
  TrendingUp,
  Award,
  Layers,
  Sliders,
  Check,
  ChevronRight
} from 'lucide-react';

export const HyperparameterTuning: React.FC = () => {
  const [nTrials, setNTrials] = useState<number>(20);
  const [studyResult, setStudyResult] = useState<OptunaStudyResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunOptuna = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runOptunaOptimization(nTrials, 'maximize', 0.824);
      setStudyResult(res);
      setIsRunning(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Optimización Bayesiana de Hiperparámetros con Optuna
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Búsqueda por Estimador Parzen Estructurado en Árbol (TPE) con poda automática de ensayos poco prometedores (Median Pruner).
        </p>
      </div>

      {/* Control Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium block mb-1">Muestreador (Sampler):</label>
            <span className="font-semibold text-slate-900 dark:text-white">TPESampler (Bayesiano)</span>
          </div>
          <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
            <label className="text-slate-400 font-medium block mb-1">Estrategia de Poda:</label>
            <span className="font-semibold text-slate-900 dark:text-white">MedianPruner (n_warmup=5)</span>
          </div>
          <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
            <label className="text-slate-400 font-medium block mb-1">Número de Ensayos:</label>
            <select
              value={nTrials}
              onChange={(e) => setNTrials(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white"
            >
              <option value={15}>15 Ensayos Rápidos</option>
              <option value={25}>25 Ensayos Equilibrados</option>
              <option value={50}>50 Ensayos Exhaustivos</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleRunOptuna}
          disabled={isRunning}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 rounded-lg shadow-sm transition-colors shrink-0"
        >
          {isRunning ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Ejecutando Optuna TPE...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Iniciar Optimización</span>
            </>
          )}
        </button>
      </div>

      {studyResult && (
        <div className="space-y-6">
          {/* Winning Trial Hero Card */}
          <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/40 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span>Configuración Ganadora (Ensayo #{studyResult.bestTrial.trialNumber})</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  ROC-AUC: {studyResult.bestTrial.metricValue}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Optimización completada en {studyResult.trials.reduce((a, b) => a + b.durationMs, 0)}ms de cómputo acumulado.
                </div>
              </div>

              {/* Best Parameters Grid */}
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {Object.entries(studyResult.bestTrial.parameters).map(([key, val]) => (
                  <div key={key} className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg">
                    <span className="text-slate-400">{key}: </span>
                    <span className="text-cyan-300 font-bold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimization History Curve */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
                <span>Curva de Convergencia del Objetivo</span>
              </h3>

              {/* Procedural Chart */}
              <div className="h-48 w-full flex items-end gap-1 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
                {studyResult.optimizationHistory.map((item) => (
                  <div key={item.trialNumber} className="flex-1 flex flex-col items-center justify-end h-full group">
                    <div
                      style={{ height: `${((item.value - 0.65) / 0.3) * 100}%` }}
                      className="w-full bg-cyan-600/70 hover:bg-cyan-400 rounded-t transition-all"
                      title={`Ensayo #${item.trialNumber}: ${item.value}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Ensayo #1</span>
                <span>Mejor avance acumulado</span>
                <span>Ensayo #{studyResult.nTrials}</span>
              </div>
            </div>

            {/* Hyperparameter Importance */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-500" />
                <span>Importancia Relativa de Hiperparámetros</span>
              </h3>

              <div className="space-y-3 pt-2 text-xs">
                {studyResult.paramImportances.map((p) => (
                  <div key={p.parameter} className="space-y-1">
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span className="font-mono">{p.parameter}</span>
                      <span className="font-mono font-semibold tabular-nums">
                        {(p.importance * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${p.importance * 100}%` }}
                        className="bg-cyan-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
