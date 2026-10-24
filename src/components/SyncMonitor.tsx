/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CountryCode } from '../types';
import { COUNTRIES_DATA } from '../data/countries';
import {
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  Ban,
  Clock,
  CheckCircle,
  Database,
  Sliders,
  ShieldAlert
} from 'lucide-react';

interface SyncMonitorProps {
  selectedCountry: CountryCode;
}

export const SyncMonitor: React.FC<SyncMonitorProps> = ({ selectedCountry }) => {
  const [wsConnected, setWsConnected] = useState<boolean>(true);
  const [activeTasks, setActiveTasks] = useState<
    { id: string; name: string; type: string; progress: number; status: 'running' | 'completed' | 'cancelled' }[]
  >([
    {
      id: 'task_sim_4091',
      name: 'Simulación Monte Carlo (100 réplicas)',
      type: 'Escenario Contrafactual',
      progress: 100,
      status: 'completed'
    },
    {
      id: 'task_ingest_chirps',
      name: 'Indexación Raster CHIRPS v2.0 (SPI-3)',
      type: 'Ingesta de Datos Observados',
      progress: 68,
      status: 'running'
    }
  ]);

  const activeCountry = COUNTRIES_DATA[selectedCountry];

  const handleCancelTask = (taskId: string) => {
    setActiveTasks(
      activeTasks.map((t) => (t.id === taskId ? { ...t, status: 'cancelled' } : t))
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sincronización en Tiempo Real y Cola de Tareas
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor de WebSockets autenticados, orquestación Celery / Redis y control explícito entre actualización de interfaz, reejecución de escenarios e ingesta de datos.
        </p>
      </div>

      {/* 3 Explicit States Clarification Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <span>1. Actualización de Interfaz</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Manipulación de filtros visuales y capas 3D. Opera exclusivamente en memoria cliente sin alterar registros maestros.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
            <RefreshCw className="w-4 h-4 text-emerald-500" />
            <span>2. Reejecución de Escenarios</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Cálculo contrafactual de políticas sobre copias aisladas. No sobreescribe microdatos originales ni activa reentrenamiento automático.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
            <Database className="w-4 h-4 text-amber-500" />
            <span>3. Ingesta de Datos Observados</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Incorporación formal de nuevas olas censales o rasters climáticos con versión inmutable y corte temporal fechado.
          </p>
        </div>
      </div>

      {/* Connection Status & Metadata */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Canal WebSocket (/ws/v1/simulation-events)
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Estado de Conexión:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Conectado (Latencia 18ms)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Última Observación Empírica</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">
              2024-T3 (Fuente: {activeCountry.primaryStatisticalInstitute.split(' ')[0]})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Sincronización Satelital CHIRPS</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">
              Actualizado (Resolución 0.05°)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Versionado de Mensajes</span>
            <span className="font-mono text-cyan-600 dark:text-cyan-400 mt-0.5 block">
              Protocolo v1.4.2 (Idempotente)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Invalidador Automático</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 block">
              Activo ante cambio de parámetros
            </span>
          </div>
        </div>
      </div>

      {/* Running Tasks Queue */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Tareas en Procesamiento Distribuido (Celery Workers)
        </h3>

        <div className="space-y-3">
          {activeTasks.map((task) => (
            <div
              key={task.id}
              className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{task.name}</span>
                  <span className="text-slate-400 text-[11px] ml-2">[{task.type}]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-500">{task.id}</span>
                  {task.status === 'running' && (
                    <button
                      onClick={() => handleCancelTask(task.id)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors"
                    >
                      <Ban className="w-3 h-3" />
                      <span>Cancelar</span>
                    </button>
                  )}
                  {task.status === 'completed' && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Completada</span>
                  )}
                  {task.status === 'cancelled' && (
                    <span className="text-rose-500 font-semibold">Cancelada</span>
                  )}
                </div>
              </div>

              {task.status === 'running' && (
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div style={{ width: `${task.progress}%` }} className="bg-cyan-500 h-full rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Avance: {task.progress}%</span>
                    <span>Worker: celery@node-01-southamerica</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
