/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HouseholdAgent, StatisticalTest } from '../types';
import { runStatisticalValidationSuite } from '../engine/statisticalTests';
import { COUNTRIES_DATA } from '../data/countries';
import {
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Scale,
  RotateCw,
  Info,
  Filter
} from 'lucide-react';

interface StatisticalValidationProps {
  households: HouseholdAgent[];
  povertyLine: number;
}

export const StatisticalValidation: React.FC<StatisticalValidationProps> = ({
  households,
  povertyLine
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'policy_simulation' | 'predictive_model'>('all');
  const [tests, setTests] = useState<StatisticalTest[]>(() =>
    runStatisticalValidationSuite(households, povertyLine)
  );

  const filteredTests = activeCategory === 'all'
    ? tests
    : tests.filter((t) => t.category === activeCategory);

  const handleRecompute = () => {
    setTests(runStatisticalValidationSuite(households, povertyLine));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Validación Estadística y Pruebas de Hipótesis Formales
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Contraste riguroso de supuestos: McNemar, DeLong, Bootstrap agrupado, Hosmer-Lemeshow y corrección FDR de Benjamini-Hochberg.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeCategory === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Todas ({tests.length})
            </button>
            <button
              onClick={() => setActiveCategory('policy_simulation')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeCategory === 'policy_simulation'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Simulador
            </button>
            <button
              onClick={() => setActiveCategory('predictive_model')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeCategory === 'predictive_model'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Modelos ML
            </button>
          </div>

          <button
            onClick={handleRecompute}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
            title="Recalcular Pruebas"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTests.map((test) => {
          const isRejectH0 = test.verdict.includes('Rechaza H0');
          return (
            <div
              key={test.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold uppercase tracking-wider">
                    {test.category === 'policy_simulation' ? 'Validación del Simulador' : 'Validación Predictiva ML'}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {test.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${
                      isRejectH0
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{test.verdict}</span>
                  </span>
                </div>
              </div>

              {/* Statistical Details Strip */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Estadístico ({test.statisticName})</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                    {test.statistic}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">p-valor Calculado</span>
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm tabular-nums">
                    {test.pValue < 0.001 ? '< 0.001' : test.pValue}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">p-valor Ajustado ({test.multipleTestingCorrection})</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-sm tabular-nums">
                    {test.adjustedPValue < 0.001 ? '< 0.001' : test.adjustedPValue}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{test.effectSizeMetric}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                    {test.effectSize}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Intervalo de Confianza (95%)</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-sm tabular-nums">
                    [{test.confidenceInterval[0]}, {test.confidenceInterval[1]}]
                  </span>
                </div>
              </div>

              {/* Hypotheses and Assumptions */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Hipótesis Nula: </span>
                  {test.hypothesis}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Supuestos Verificados: </span>
                  {test.assumptions}
                </div>
              </div>

              {/* Methodological Note */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Interpretación Empírica: </span>
                {test.methodologicalNote}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
