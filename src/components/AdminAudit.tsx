/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuditLogEntry } from '../types';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  EyeOff,
  History,
  FileCheck,
  Sliders,
  Check
} from 'lucide-react';

export const AdminAudit: React.FC = () => {
  const [activeRole, setActiveRole] = useState<'Administrador' | 'Analista de Políticas' | 'Investigador'>('Administrador');
  const [minCellSuppression, setMinCellSuppression] = useState<number>(5);
  const [suppressionEnabled, setSuppressionEnabled] = useState<boolean>(true);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log_001',
      timestamp: '2026-10-24 00:25:12',
      userRole: 'Administrador',
      action: 'Publicación de Modelo',
      resource: 'LightGBM_Pobreza_v2.0',
      details: 'Promovido a producción tras superar test de DeLong (p<0.001)',
      versionHash: 'sha256:7f8a9b2c3d4e5f6a'
    },
    {
      id: 'log_002',
      timestamp: '2026-10-24 00:34:40',
      userRole: 'Analista de Políticas',
      action: 'Simulación de Política',
      resource: 'Escenario CCT Educación + Sequía',
      details: 'Ejecutadas 120 réplicas Bootstrap con factor expansivo',
      versionHash: 'sha256:1a2b3c4d5e6f7a8b'
    },
    {
      id: 'log_003',
      timestamp: '2026-10-24 00:42:19',
      userRole: 'Investigador',
      action: 'Exportación de Microdatos',
      resource: 'Dataset Sintético Ponderado PER',
      details: 'Aplicada regla de supresión de celdas < 5 individuos',
      versionHash: 'sha256:3c4d5e6f7a8b9c0d'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Administración, Seguridad y Registro de Auditoría
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Control de acceso basado en roles (RBAC), regla de supresión de celdas para protección de privacidad estadística y registro inmutable de auditoría.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Role Selector Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-500" />
            <span>Rol Activo del Usuario</span>
          </h3>

          <div className="space-y-2">
            {(['Administrador', 'Analista de Políticas', 'Investigador'] as const).map((r) => (
              <label
                key={r}
                onClick={() => setActiveRole(r)}
                className={`flex items-center justify-between p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                  activeRole === r
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 text-cyan-900 dark:text-cyan-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <span>{r}</span>
                {activeRole === r && <Check className="w-4 h-4 text-cyan-500" />}
              </label>
            ))}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Permisos: {activeRole === 'Administrador' ? 'Edición total, publicación de modelos y configuración Langflow.' : 'Ejecución de simulaciones y consulta RAG autorizada.'}
          </div>
        </div>

        {/* Statistical Disclosure Control / Privacy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 md:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-cyan-500" />
            <span>Control de Divulgación Estadística y Privacidad (Cell Suppression)</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Para prevenir la re-identificación de hogares o productores rurales en microdatos o tabulados diseminados, se suprimen automáticamente celdas con recuentos muestrales inferiores al umbral mínimo de seguridad.
          </p>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Regla de Supresión Mínima de Celdas
              </div>
              <div className="text-[11px] text-slate-500">
                Umbral de protección k-anonimato: {minCellSuppression} hogares
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="3"
                max="20"
                value={minCellSuppression}
                onChange={(e) => setMinCellSuppression(Number(e.target.value))}
                className="w-16 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1 text-center font-mono"
              />
              <input
                type="checkbox"
                checked={suppressionEnabled}
                onChange={(e) => setSuppressionEnabled(e.target.checked)}
                className="rounded text-cyan-600 focus:ring-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-500" />
          <span>Registro Criptográfico Inmutable de Acciones (Audit Trail)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Rol</th>
                <th className="py-2.5 px-3">Acción</th>
                <th className="py-2.5 px-3">Recurso</th>
                <th className="py-2.5 px-3">Detalles</th>
                <th className="py-2.5 px-3 font-mono">Hash SHA-256</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono text-slate-400">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">{log.userRole}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{log.action}</td>
                  <td className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400">{log.resource}</td>
                  <td className="py-2.5 px-3 text-slate-500">{log.details}</td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">{log.versionHash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
