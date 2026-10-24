/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CrispDmPhase } from '../types';
import {
  Briefcase,
  Database,
  Wrench,
  Cpu,
  CheckCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface CrispDmFlowProps {
  currentPhase: CrispDmPhase;
  onSelectPhase: (phase: CrispDmPhase) => void;
  onNavigateTab: (tabId: string) => void;
}

const PHASES: {
  id: CrispDmPhase;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  associatedTabs: { label: string; tabId: string }[];
  deliverables: string[];
  metrics: string[];
}[] = [
  {
    id: 'business_understanding',
    title: '1. Comprensión del Negocio y Política Pública',
    subtitle: 'Problema social, focalización y restricciones fiscales',
    icon: Briefcase,
    description:
      'Definición del desafío de erradicación de pobreza rural extrema y construcción de resiliencia socio-climática en los 12 países de Sudamérica.',
    associatedTabs: [
      { label: 'Laboratorio de Políticas', tabId: 'policy_lab' },
      { label: 'Marco Institucional y Catálogo', tabId: 'catalog' }
    ],
    deliverables: [
      'Árbol de objetivos de política social y reglas de elegibilidad',
      'Matriz de restricciones de presupuesto público nacional',
      'Definición de trade-offs: Cobertura universal vs Focalización estricta'
    ],
    metrics: ['Tasa FGT0 objetivo <= 15%', 'Brecha FGT1', 'Multiplicador fiscal rural >= 1.25']
  },
  {
    id: 'data_understanding',
    title: '2. Comprensión de los Datos',
    subtitle: 'Catálogo oficial, procedencia, calidad y EDA',
    icon: Database,
    description:
      'Revisión metódica de microdatos de encuestas nacionales de hogares (ENAHO, PNAD, EPH, CASEN, GEIH, ENEMDU) e índices climáticos raster (CHIRPS, ERA5).',
    associatedTabs: [
      { label: 'Catálogo de Fuentes Oficiales', tabId: 'catalog' },
      { label: 'Análisis Exploratorio (EDA)', tabId: 'eda' }
    ],
    deliverables: [
      'Inventario de microdatos oficiales de los 12 países soberanos + Guayana Francesa',
      'Matriz de calidad: Cobertura, valores faltantes y factores de expansión',
      'Análisis de distribuciones de consumo, ingresos agropecuarios y choque climático'
    ],
    metrics: ['Tasa de completitud > 98%', 'Factores de expansión representativos', 'Valores cero distinguidos de missing']
  },
  {
    id: 'data_preparation',
    title: '3. Preparación y Manipulación de Datos',
    subtitle: 'Limpieza, transformaciones e ingeniería de variables',
    icon: Wrench,
    description:
      'Procesamiento reproducible de variables de hogares, imputación controlada, paridad de poder adquisitivo (PPP) y aislamiento estricto de conjuntos de entrenamiento.',
    associatedTabs: [
      { label: 'Estudio de Preparación', tabId: 'preparation' }
    ],
    deliverables: [
      'Ingeniería de variables: Ratio de dependencia, Índice de activos físicos, Vulnerabilidad climática',
      'Winsorización de valores atípicos y normalización logarítmica',
      'Partición agrupada por conglomerado (PSU) con CERO fuga de información'
    ],
    metrics: ['Zero information leakage verificado', 'Trazabilidad de versiones SHA-256']
  },
  {
    id: 'modeling',
    title: '4. Modelado y Calibración del Gemelo',
    subtitle: 'Simulación de agentes, ML y búsqueda Optuna',
    icon: Cpu,
    description:
      'Arquitectura dual: Modelo Basado en Agentes (ABM) con micro-simulación de transferencias y modelos de aprendizaje supervisado (Gradient Boosting, Random Forest).',
    associatedTabs: [
      { label: 'Gemelo Digital 3D', tabId: 'twin_3d' },
      { label: 'Entrenamiento ML', tabId: 'ml_models' },
      { label: 'Optimización Optuna', tabId: 'optuna' }
    ],
    deliverables: [
      'Reglas de decisión de consumo, ahorro y desacumulación de activos ante choques',
      'Búsqueda bayesiana de hiperparámetros con poda de ensayos en Optuna',
      'Calibración retrospectiva con series empíricas nacionales'
    ],
    metrics: ['ROC-AUC >= 0.85', 'Brier Score <= 0.12', 'Conservación estricta de presupuestos']
  },
  {
    id: 'evaluation',
    title: '5. Evaluación y Validación Estadística',
    subtitle: 'Bootstrap, DeLong, McNemar, equidad e incertidumbre',
    icon: CheckCircle,
    description:
      'Validación estadística exhaustiva: contraste de hipótesis nulas, significancia de impacto con intervalos bootstrap al 95% y corrección por multiplicidad FDR.',
    associatedTabs: [
      { label: 'Validación Estadística', tabId: 'statistical_tests' },
      { label: 'Comparación y Gobernanza', tabId: 'model_comparison' }
    ],
    deliverables: [
      'Prueba de McNemar para asimetría en superación de pobreza',
      'Prueba Z de DeLong para discriminación entre familias de algoritmos',
      'Evaluación de equidad interétnica y territorial por subgrupos'
    ],
    metrics: ['Intervalo de confianza Bootstrap [3.4%, 6.3%]', 'p-valor < 0.001', 'FDR Benjamini-Hochberg ajustado']
  },
  {
    id: 'deployment',
    title: '6. Despliegue, Sincronización y Seguimiento',
    subtitle: 'Modelos publicados, WebSockets, RAG y reportes',
    icon: Activity,
    description:
      'Puesta en producción de políticas simuladas, sincronización reactiva, flujos Langflow de consulta y generación auditable de reportes ejecutivos.',
    associatedTabs: [
      { label: 'Sincronización en Tiempo Real', tabId: 'sync' },
      { label: 'Asistente LangChain / RAG', tabId: 'assistant' },
      { label: 'Flujos Langflow', tabId: 'langflow' },
      { label: 'Exportación de Informes', tabId: 'reports' }
    ],
    deliverables: [
      'API REST y WebSockets autenticados con control de estados',
      'Agente RAG con citas documentales exactas y sin alucinaciones numéricas',
      'Manifiesto reproducible con semilla, hash y exportación HTML/PDF'
    ],
    metrics: ['Latencia de simulación < 250ms', 'Trazabilidad 100% auditable', 'Reportes reproducibles']
  }
];

export const CrispDmFlow: React.FC<CrispDmFlowProps> = ({
  currentPhase,
  onSelectPhase,
  onNavigateTab
}) => {
  const activePhaseData = PHASES.find((p) => p.id === currentPhase) || PHASES[0];

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Metodología CRISP-DM Integrada
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
          Estructura metodológica integral para ciencia de datos y evaluación causal de políticas públicas. Navega entre etapas para auditar la trazabilidad desde el objetivo social hasta el despliegue del gemelo digital.
        </p>
      </div>

      {/* 6-Stage Interactive Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {PHASES.map((phase, idx) => {
          const Icon = phase.icon;
          const isActive = phase.id === currentPhase;
          return (
            <button
              key={phase.id}
              onClick={() => onSelectPhase(phase.id)}
              className={`flex flex-col text-left p-3 rounded-lg border transition-all ${
                isActive
                  ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500/80 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-mono font-semibold ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`}>
                  0{idx + 1}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`} />
              </div>
              <div className={`text-xs font-semibold leading-snug line-clamp-2 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {phase.title.split('. ')[1]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              <span>Fase Activa</span>
              <span aria-hidden="true">·</span>
              <span>CRISP-DM</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {activePhaseData.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activePhaseData.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Accesos directos de esta fase:</span>
            {activePhaseData.associatedTabs.map((link) => (
              <button
                key={link.tabId}
                onClick={() => onNavigateTab(link.tabId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-800 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          {/* Objective & Description */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Objetivo Científico
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {activePhaseData.description}
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Garantía de Rigor</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Cada transformación preserva trazabilidad de versiones SHA-256 y separa datos observados de simulaciones contrafactuales.
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Entregables e Invariantes
            </h4>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {activePhaseData.deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">✓</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Metrics & Tolerances */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Criterios de Aceptación
            </h4>
            <div className="space-y-2">
              {activePhaseData.metrics.map((m, i) => (
                <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-300">
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
