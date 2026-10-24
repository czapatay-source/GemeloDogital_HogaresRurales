/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HouseholdAgent, MLModelExperiment } from '../types';
import { MLTrainingConfig, trainMLModel } from '../engine/machineLearning';
import {
  Cpu,
  Play,
  RotateCw,
  BarChart,
  ShieldCheck,
  CheckCircle,
  Activity,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface ModelTrainingProps {
  households: HouseholdAgent[];
  onModelTrained: (model: MLModelExperiment) => void;
  activeModel: MLModelExperiment | null;
}

const AVAILABLE_FEATURES = [
  { id: 'householdSize', label: 'Tamaño del Hogar' },
  { id: 'numChildren', label: 'Menores de 18 años' },
  { id: 'dependencyRatio', label: 'Ratio de Dependencia Demográfica' },
  { id: 'femaleHead', label: 'Jefatura Femenina (Dicotómica)' },
  { id: 'indigenousOrAfro', label: 'Autoidentificación Indígena/Afro' },
  { id: 'headEducationYears', label: 'Años Educación del Jefe' },
  { id: 'landHectares', label: 'Superficie de Tierra (ha)' },
  { id: 'livestockUnits', label: 'Unidades de Ganado Mayor' },
  { id: 'physicalAssetIndex', label: 'Índice de Activos Físicos (0-1)' },
  { id: 'irrigationAccess', label: 'Acceso a Riego Tecnificado' },
  { id: 'electricityAccess', label: 'Acceso a Electricidad' },
  { id: 'roadDistanceKm', label: 'Distancia a Red Vial Principal (km)' },
  { id: 'creditAccess', label: 'Acceso al Sistema Financiero/Crédito' },
  { id: 'droughtVulnerability', label: 'Vulnerabilidad a Sequía' },
  { id: 'floodVulnerability', label: 'Vulnerabilidad a Inundación' }
];

export const ModelTraining: React.FC<ModelTrainingProps> = ({
  households,
  onModelTrained,
  activeModel
}) => {
  const [taskType, setTaskType] = useState<'classification_poverty' | 'regression_income'>('classification_poverty');
  const [algorithm, setAlgorithm] = useState<'logistic_or_ridge' | 'random_forest' | 'gradient_boosting'>('gradient_boosting');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'householdSize',
    'numChildren',
    'dependencyRatio',
    'headEducationYears',
    'landHectares',
    'livestockUnits',
    'physicalAssetIndex',
    'irrigationAccess',
    'roadDistanceKm',
    'droughtVulnerability'
  ]);
  const [testSplit, setTestSplit] = useState<number>(0.25);
  const [isTraining, setIsTraining] = useState<boolean>(false);

  const toggleFeature = (id: string) => {
    if (selectedFeatures.includes(id)) {
      if (selectedFeatures.length > 2) {
        setSelectedFeatures(selectedFeatures.filter((f) => f !== id));
      }
    } else {
      setSelectedFeatures([...selectedFeatures, id]);
    }
  };

  const handleStartTraining = () => {
    setIsTraining(true);
    setTimeout(() => {
      const config: MLTrainingConfig = {
        taskType,
        algorithm,
        features: selectedFeatures,
        targetVariable: taskType === 'classification_poverty' ? 'baselinePovertyStatus' : 'baselineConsumptionPerCapita',
        testSplitRatio: testSplit,
        randomSeed: 2026,
        hyperparameters: {
          n_estimators: 180,
          max_depth: 6,
          learning_rate: 0.08,
          l2_regularization: 0.02
        }
      };

      const result = trainMLModel(households, config);
      onModelTrained(result);
      setIsTraining(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Estudio de Entrenamiento y Validación de Modelos Machine Learning
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configuración y entrenamiento de modelos predictivos para focalización de transferencias. Partición agrupada por conglomerado (PSU) garantizando cero fuga de información.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Model Setup (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-500" />
              <span>Configuración de Entrenamiento</span>
            </h3>

            {/* Task Type */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Tipo de Tarea
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTaskType('classification_poverty')}
                  className={`p-2 text-xs font-medium rounded-lg border text-left transition-colors ${
                    taskType === 'classification_poverty'
                      ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div>Clasificación</div>
                  <div className="text-[10px] text-slate-500">Pobreza (Pobre / No Pobre)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTaskType('regression_income')}
                  className={`p-2 text-xs font-medium rounded-lg border text-left transition-colors ${
                    taskType === 'regression_income'
                      ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div>Regresión</div>
                  <div className="text-[10px] text-slate-500">Consumo Per Cápita</div>
                </button>
              </div>
            </div>

            {/* Algorithm Selector */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Algoritmo Predictivo
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setAlgorithm('gradient_boosting')}
                  className={`px-2 py-1.5 text-xs font-medium rounded-lg border text-center transition-colors ${
                    algorithm === 'gradient_boosting'
                      ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Gradient Boosting
                </button>
                <button
                  type="button"
                  onClick={() => setAlgorithm('random_forest')}
                  className={`px-2 py-1.5 text-xs font-medium rounded-lg border text-center transition-colors ${
                    algorithm === 'random_forest'
                      ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Random Forest
                </button>
                <button
                  type="button"
                  onClick={() => setAlgorithm('logistic_or_ridge')}
                  className={`px-2 py-1.5 text-xs font-medium rounded-lg border text-center transition-colors ${
                    algorithm === 'logistic_or_ridge'
                      ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {taskType === 'classification_poverty' ? 'Logística L2' : 'Ridge L2'}
                </button>
              </div>
            </div>

            {/* Feature Selection Checklist */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Variables Predictoras Seleccionadas ({selectedFeatures.length})
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedFeatures(AVAILABLE_FEATURES.map((f) => f.id))}
                  className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Seleccionar Todas
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                {AVAILABLE_FEATURES.map((feat) => (
                  <label
                    key={feat.id}
                    className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded cursor-pointer text-slate-700 dark:text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feat.id)}
                      onChange={() => toggleFeature(feat.id)}
                      className="rounded text-cyan-600 focus:ring-0"
                    />
                    <span className="truncate">{feat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Split Ratio & Leakage Guarantee */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-2">
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
                <span>Partición Test Agrupada por PSU:</span>
                <span className="font-mono text-cyan-500 font-bold">{Math.round(testSplit * 100)}%</span>
              </div>
              <div className="text-[11px] text-slate-500">
                La partición respeta los clusters de la encuesta para asegurar que ningún hogar de la misma unidad primaria aparezca simultáneamente en train y test.
              </div>
            </div>

            {/* Start Training Button */}
            <button
              onClick={handleStartTraining}
              disabled={isTraining}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {isTraining ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Entrenando y Validando por Conglomerados...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Entrenar Modelo y Calcular Métricas</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Model Metrics & Feature Importance (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {activeModel ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-semibold">
                    Experimento Registrado
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeModel.name}
                  </h4>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Duración: {activeModel.durationMs}ms · 5 Folds
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeModel.taskType === 'classification_poverty' ? (
                  <>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="text-[11px] text-slate-400 font-medium">Exactitud (Accuracy)</div>
                      <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                        {((activeModel.trainingMetrics.accuracy || 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="text-[11px] text-slate-400 font-medium">ROC-AUC</div>
                      <div className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1 tabular-nums">
                        {activeModel.trainingMetrics.rocAuc}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="text-[11px] text-slate-400 font-medium">F1-Score</div>
                      <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                        {activeModel.trainingMetrics.f1Score}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="text-[11px] text-slate-400 font-medium">Brier Score</div>
                      <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                        {activeModel.trainingMetrics.brierScore}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="text-[11px] text-slate-400 font-medium">R² de Bondad</div>
                      <div className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1 tabular-nums">
                        {activeModel.trainingMetrics.r2}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="text-[11px] text-slate-400 font-medium">MAE (USD PPP)</div>
                      <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                        ${activeModel.trainingMetrics.mae}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="text-[11px] text-slate-400 font-medium">RMSE</div>
                      <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                        ${activeModel.trainingMetrics.rmse}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="text-[11px] text-slate-400 font-medium">Score Validación</div>
                      <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                        {activeModel.trainingMetrics.valScore}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Feature Importance Bars */}
              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Importancia de Variables (Gini Reduction)
                </h5>
                <div className="space-y-1.5 text-xs">
                  {activeModel.featureImportances.slice(0, 6).map((item) => (
                    <div key={item.feature} className="space-y-1">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>{item.feature}</span>
                        <span className="font-mono tabular-nums font-semibold">
                          {(item.importance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${item.importance * 100}%` }}
                          className="bg-cyan-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center shadow-sm">
              <Cpu className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Ningún Modelo Entrenado en Esta Sesión
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Selecciona algoritmo y variables en el panel lateral y presiona "Entrenar Modelo" para obtener métricas y matriz de importancia.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
