/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MLModelExperiment } from '../types';
import {
  Scale,
  Award,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  UploadCloud,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface ModelComparisonProps {
  models: MLModelExperiment[];
  onPublishModel: (modelId: string) => void;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({
  models,
  onPublishModel
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    models[0]?.id || 'mod_gb_best'
  );
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);

  // Baseline comparison candidates
  const candidateModels: {
    id: string;
    name: string;
    algorithm: string;
    primaryMetric: number; // ROC-AUC
    brierCalibration: number;
    subgroupDisparity: number; // Disparidad territorial máxima
    inferenceLatencyMs: number;
    interpretability: 'Alta' | 'Media' | 'Baja';
    status: 'Candidato Ganador' | 'Línea Base' | 'Alternativo';
    justification: string;
  }[] = [
    {
      id: 'mod_gb_best',
      name: 'Gradient Boosting Calibrado (Optuna TPE)',
      algorithm: 'LightGBM / XGBoost Surr.',
      primaryMetric: 0.884,
      brierCalibration: 0.082,
      subgroupDisparity: 0.042,
      inferenceLatencyMs: 4.8,
      interpretability: 'Media',
      status: 'Candidato Ganador',
      justification:
        'Presenta la mayor capacidad discriminativa (ROC-AUC 0.884) con calibración óptima (Brier 0.082) y estabilidad territorial probada a través de las 6 tipologías rurales.'
    },
    {
      id: 'mod_rf_ensemble',
      name: 'Random Forest 150 Árboles',
      algorithm: 'Random Forest Ensembles',
      primaryMetric: 0.852,
      brierCalibration: 0.098,
      subgroupDisparity: 0.058,
      inferenceLatencyMs: 8.2,
      interpretability: 'Media',
      status: 'Alternativo',
      justification:
        'Robusto ante sobreajuste en muestras pequeñas, pero con menor agilidad para capturar no linealidades agroclimáticas complejas.'
    },
    {
      id: 'mod_logistic_baseline',
      name: 'Regresión Logística Regularizada L2',
      algorithm: 'Ridge Logistic (Scikit-Learn)',
      primaryMetric: 0.812,
      brierCalibration: 0.115,
      subgroupDisparity: 0.079,
      inferenceLatencyMs: 0.9,
      interpretability: 'Alta',
      status: 'Línea Base',
      justification:
        'Excelente interpretabilidad para auditoría legislativa, pero penaliza la tasa de captura en hogares con alta exposición climática.'
    }
  ];

  const handlePublish = (id: string) => {
    onPublishModel(id);
    setPublishFeedback('Modelo publicado en el Registro de Producción (MLflow Registry). Versión activa para inferencia en tiempo real.');
    setTimeout(() => setPublishFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Selección Multicriterio del Mejor Modelo y Gobernanza
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Evaluación equilibrada de precisión, calibración, equidad territorial por subgrupos y latencia de inferencia antes de la publicación oficial.
        </p>
      </div>

      {publishFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{publishFeedback}</span>
        </div>
      )}

      {/* Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-mono uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Modelo Evaluado</th>
              <th className="py-3 px-4 text-right">ROC-AUC (Métrica Primaria)</th>
              <th className="py-3 px-4 text-right">Brier Score (Calibración)</th>
              <th className="py-3 px-4 text-right">Disparidad Subgrupos</th>
              <th className="py-3 px-4 text-right">Latencia Inferencia</th>
              <th className="py-3 px-4 text-center">Interpretabilidad</th>
              <th className="py-3 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {candidateModels.map((m) => {
              const isSelected = m.id === selectedCandidateId;
              return (
                <tr
                  key={m.id}
                  onClick={() => setSelectedCandidateId(m.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-cyan-50/50 dark:bg-cyan-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {m.status === 'Candidato Ganador' && <Award className="w-4 h-4 text-cyan-500" />}
                      <span>{m.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{m.algorithm}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-sm text-cyan-600 dark:text-cyan-400 tabular-nums">
                    {m.primaryMetric}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {m.brierCalibration}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {m.subgroupDisparity}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {m.inferenceLatencyMs} ms
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                      {m.interpretability}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublish(m.id);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Publicar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Justification Card */}
      {selectedCandidateId && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
            <Info className="w-4 h-4 text-cyan-500" />
            <span>Justificación Científica de la Selección</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {candidateModels.find((m) => m.id === selectedCandidateId)?.justification}
          </p>
          <div className="text-[11px] text-slate-500 italic">
            Nota de auditoría: El modelo no es seleccionado únicamente por exactitud global (accuracy), sino por el balance entre área bajo la curva (ROC-AUC), bajo sesgo en grupos indígenas y latencia inferior a 10ms.
          </div>
        </div>
      )}
    </div>
  );
};
