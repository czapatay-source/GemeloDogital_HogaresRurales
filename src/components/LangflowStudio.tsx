/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Workflow,
  Play,
  CheckCircle,
  FileCode,
  Download,
  Shield,
  Layers,
  ArrowRight,
  RotateCw,
  Cpu,
  Info
} from 'lucide-react';

interface LangflowFlow {
  id: string;
  name: string;
  category: string;
  version: string;
  description: string;
  nodesCount: number;
  inputContract: string;
  outputContract: string;
  sampleExecutionResult?: string;
}

const PREBUILT_FLOWS: LangflowFlow[] = [
  {
    id: 'flow_rag_docs',
    name: '01. Flujo RAG de Documentación Oficial de Políticas',
    category: 'Recuperación de Conocimiento',
    version: 'v1.3.0',
    description: 'Consulta semántica con pgvector sobre manuales operativos de ANSES, MDS, Prosperidad Social y CASEN.',
    nodesCount: 6,
    inputContract: '{ query: string, country_code: string, top_k: int }',
    outputContract: '{ answer: string, sources: List[DocumentCitation] }',
    sampleExecutionResult: 'Recuperados 4 fragmentos con similitud coseno > 0.82 del manual operativo oficial.'
  },
  {
    id: 'flow_eda_interpreter',
    name: '02. Flujo de Interpretación Automatizada de EDA',
    category: 'Analítica Exploratoria',
    version: 'v1.1.2',
    description: 'Analiza asimetría en distribuciones de ingresos rurales y correlación con choques climáticos.',
    nodesCount: 5,
    inputContract: '{ dataset_summary: JSON, fgt_baseline: float }',
    outputContract: '{ insights: List[string], risk_warnings: List[string] }',
    sampleExecutionResult: 'Generada síntesis determinista sobre concentración de gasto calórico en deciles 1 y 2.'
  },
  {
    id: 'flow_model_comparator',
    name: '03. Flujo Comparador y Benchmark de Modelos ML',
    category: 'Gobernanza de Modelos',
    version: 'v2.0.1',
    description: 'Ejecuta contrastes estadísticos pareados y genera la justificación formal para selección en producción.',
    nodesCount: 8,
    inputContract: '{ candidate_models: List[ModelMetrics], primary_metric: string }',
    outputContract: '{ selected_model_id: string, technical_justification: string }',
    sampleExecutionResult: 'Seleccionado LightGBM por superioridad en DeLong Z=3.42 (p<0.001) y calibración Brier=0.082.'
  },
  {
    id: 'flow_policy_evaluator',
    name: '04. Flujo Evaluador de Choques Climáticos y Resiliencia',
    category: 'Microsimulación de Políticas',
    version: 'v1.4.0',
    description: 'Simula interacción entre transferencias condicionadas y resiliencia ante sequías o inundaciones.',
    nodesCount: 7,
    inputContract: '{ policy_params: JSON, shock_spec: JSON }',
    outputContract: '{ simulated_fgt0: float, poverty_reduction_pp: float, fiscal_multiplier: float }',
    sampleExecutionResult: 'Simulación completada: Reducción estimada de 4.8 pp de pobreza rural y multiplicador fiscal de 1.34x.'
  },
  {
    id: 'flow_report_generator',
    name: '05. Flujo Generador de Informes de Políticas Reproducibles',
    category: 'Automatización y Reportes',
    version: 'v1.2.0',
    description: 'Ensambla informe ejecutivo HTML/PDF completo con parámetros, semillas, intervalos y fuentes oficiales.',
    nodesCount: 9,
    inputContract: '{ simulation_result_id: string, user_role: string, language: string }',
    outputContract: '{ report_html: string, artifact_hash: string }',
    sampleExecutionResult: 'Informe generado exitosamente con firma criptográfica SHA-256 e intervalos de incertidumbre al 95%.'
  }
];

export const LangflowStudio: React.FC = () => {
  const [selectedFlow, setSelectedFlow] = useState<LangflowFlow>(PREBUILT_FLOWS[3]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);

  const handleTestRun = () => {
    setIsExecuting(true);
    setExecutionOutput(null);
    setTimeout(() => {
      setExecutionOutput(selectedFlow.sampleExecutionResult || 'Ejecución completada con éxito.');
      setIsExecuting(false);
    }, 800);
  };

  const handleDownloadFlowJson = () => {
    const jsonStr = JSON.stringify(
      {
        name: selectedFlow.name,
        version: selectedFlow.version,
        description: selectedFlow.description,
        nodes: [
          { id: 'node_input', type: 'InputNode', contract: selectedFlow.inputContract },
          { id: 'node_tool_exec', type: 'BackendRpcTool', tool: 'scientific_engine_rpc' },
          { id: 'node_output', type: 'OutputNode', contract: selectedFlow.outputContract }
        ]
      },
      null,
      2
    );

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFlow.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Integración de Flujos Langflow
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Flujos importables y ejecutables desplegados como microservicio independiente e integrados vía API desde FastAPI. Los analistas ejecutan flujos aprobados; los administradores configuran la topología.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Flows List Column (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Workflow className="w-4 h-4 text-cyan-500" />
            <span>Flujos Aprobados en Producción ({PREBUILT_FLOWS.length})</span>
          </h3>

          <div className="space-y-2">
            {PREBUILT_FLOWS.map((flow) => {
              const isSelected = flow.id === selectedFlow.id;
              return (
                <div
                  key={flow.id}
                  onClick={() => {
                    setSelectedFlow(flow);
                    setExecutionOutput(null);
                  }}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">{flow.name}</span>
                    <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950 px-2 py-0.5 rounded">
                      {flow.version}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1 line-clamp-2">{flow.description}</div>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                    <span>{flow.nodesCount} nodos</span>
                    <span>·</span>
                    <span>{flow.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flow Inspector & Execution Console (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold uppercase tracking-wider">
                  Inspección de Contrato de Flujo
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedFlow.name}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadFlowJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Exportar JSON</span>
                </button>

                <button
                  onClick={handleTestRun}
                  disabled={isExecuting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 rounded-lg shadow-sm transition-colors"
                >
                  {isExecuting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Ejecutando...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Ejecutar Flujo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Contracts Specification */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-mono uppercase mb-1">
                  Contrato de Entrada (Input Schema)
                </span>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-cyan-600 dark:text-cyan-400">
                  {selectedFlow.inputContract}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-mono uppercase mb-1">
                  Contrato de Salida (Output Schema)
                </span>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-emerald-600 dark:text-emerald-400">
                  {selectedFlow.outputContract}
                </div>
              </div>
            </div>

            {/* Execution Result Log */}
            {executionOutput && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Resultado de la Inferencia Langflow</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs text-slate-800 dark:text-slate-200">
                  {executionOutput}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
