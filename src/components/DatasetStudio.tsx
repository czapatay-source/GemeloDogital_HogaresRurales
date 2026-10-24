/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CountryCode, HouseholdAgent } from '../types';
import { COUNTRIES_DATA } from '../data/countries';
import {
  BUILTIN_DATASETS,
  DatasetMetadata,
  generateMasterDataset,
  generateSampleCsvTemplate,
  parseUserCsvToHouseholds
} from '../data/masterDataset';
import {
  Database,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Check,
  Layers,
  ArrowRight,
  ShieldCheck,
  Eye,
  FileCheck
} from 'lucide-react';

interface DatasetStudioProps {
  selectedCountry: CountryCode;
  onSelectCountry: (code: CountryCode) => void;
  activeHouseholds: HouseholdAgent[];
  onSetActiveHouseholds: (households: HouseholdAgent[], meta: DatasetMetadata) => void;
  activeDatasetId: string;
}

export const DatasetStudio: React.FC<DatasetStudioProps> = ({
  selectedCountry,
  onSelectCountry,
  activeHouseholds,
  onSetActiveHouseholds,
  activeDatasetId
}) => {
  const [datasetsList, setDatasetsList] = useState<DatasetMetadata[]>(BUILTIN_DATASETS);
  const [currentDatasetId, setCurrentDatasetId] = useState<string>(activeDatasetId);
  const [searchFilter, setSearchFilter] = useState('');
  const [typologyFilter, setTypologyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<{
    fileName: string;
    households: HouseholdAgent[];
    columns: string[];
    errors: string[];
  } | null>(null);

  const activeCountry = COUNTRIES_DATA[selectedCountry];

  // Switch Dataset
  const handleSelectDataset = (ds: DatasetMetadata) => {
    setCurrentDatasetId(ds.id);
    if (ds.id === 'master_south_america') {
      const masterHh = generateMasterDataset();
      onSetActiveHouseholds(masterHh, ds);
    } else if (ds.countryCode && ds.countryCode !== 'ALL') {
      onSelectCountry(ds.countryCode);
    }
  };

  // CSV File Upload & Parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const parsed = parseUserCsvToHouseholds(text, selectedCountry);
      setUploadedPreview({
        fileName: file.name,
        households: parsed.households,
        columns: parsed.detectedColumns,
        errors: parsed.errors
      });

      setUploadFeedback(`Archivo "${file.name}" analizado con éxito. Se identificaron ${parsed.households.length} registros estructurados.`);
    };
    reader.readAsText(file);
  };

  // Activate Uploaded Dataset into Master App State
  const handleActivateUploadedDataset = () => {
    if (!uploadedPreview || uploadedPreview.households.length === 0) return;

    const newDatasetMeta: DatasetMetadata = {
      id: `user_upload_${Date.now()}`,
      name: `Dataset Subido: ${uploadedPreview.fileName}`,
      description: `Conjunto de datos externo subido por el usuario con ${uploadedPreview.households.length} registros mapeados.`,
      sourceType: 'user_uploaded',
      countryCode: selectedCountry,
      totalRecords: uploadedPreview.households.length,
      totalPopulationRepresented: uploadedPreview.households.reduce((acc, h) => acc + h.expansionFactor, 0),
      createdDate: new Date().toISOString().slice(0, 10),
      isSynthetic: false,
      fileName: uploadedPreview.fileName
    };

    setDatasetsList([newDatasetMeta, ...datasetsList]);
    setCurrentDatasetId(newDatasetMeta.id);
    onSetActiveHouseholds(uploadedPreview.households, newDatasetMeta);
    setUploadFeedback(`¡Dataset "${uploadedPreview.fileName}" activado exitosamente en todo el sistema!`);
    setUploadedPreview(null);
  };

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvContent = generateSampleCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_hogares_rurales_sudamerica.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter Table Records
  const filteredRecords = activeHouseholds.filter((h) => {
    const matchesSearch =
      h.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      h.regionName.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesTypology = typologyFilter === 'all' || h.typology === typologyFilter;
    return matchesSearch && matchesTypology;
  });

  const pageSize = 12;
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const currentDatasetMeta = datasetsList.find((d) => d.id === currentDatasetId) || datasetsList[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-500" />
            <span>Gestor de Datasets y Carga de Microdatos</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Alterna entre el Dataset Maestro propio pre-cargado, datasets calibrados por país o sube tus propios archivos CSV de hogares rurales para la simulación.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Descargar Plantilla CSV</span>
        </button>
      </div>

      {uploadFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* Datasets Catalog Cards (Selectable) */}
      <div>
        <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400 block mb-2">
          Datasets Disponibles en el Proyecto
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {datasetsList.map((ds) => {
            const isSelected = ds.id === currentDatasetId;
            return (
              <div
                key={ds.id}
                onClick={() => handleSelectDataset(ds)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">{ds.name}</span>
                  {isSelected && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-600 text-white rounded-full">
                      ACTIVO
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                  {ds.description}
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span>{ds.totalRecords.toLocaleString()} registros</span>
                  <span>{ds.sourceType === 'user_uploaded' ? 'Subido por Usuario' : 'Pre-cargado'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Subir Nuevo Dataset al Proyecto (CSV o JSON)
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Mapeo automático de columnas: ingreso, consumo, miembros, educación, tierra, etc.
          </span>
        </div>

        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/50">
          <input
            type="file"
            id="csvDatasetUpload"
            accept=".csv,.txt,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="csvDatasetUpload" className="cursor-pointer block">
            <FileSpreadsheet className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Haz clic aquí para seleccionar tu archivo de microdatos
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Formato CSV delimitado por comas o punto y coma (o descarga la plantilla oficial arriba)
            </div>
          </label>
        </div>

        {/* Uploaded File Confirmation & Activation */}
        {uploadedPreview && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Archivo cargado: {uploadedPreview.fileName}
                </span>
                <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
                  {uploadedPreview.households.length} observaciones analizadas correctamente
                </div>
              </div>

              <button
                onClick={handleActivateUploadedDataset}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Activar este Dataset en Todo el Sistema</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500">
              Columnas detectadas en el encabezado:
            </div>
            <div className="flex flex-wrap gap-1 font-mono text-[10px] text-slate-700 dark:text-slate-300">
              {uploadedPreview.columns.map((col) => (
                <span key={col} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">
                  {col}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Dataset Tabular Inspection View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold uppercase tracking-wider">
              Explorador Tabular de Registros de Hogares
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {currentDatasetMeta.name} ({activeHouseholds.length} registros)
            </h3>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por ID o región..."
                value={searchFilter}
                onChange={(e) => {
                  setSearchFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={typologyFilter}
              onChange={(e) => {
                setTypologyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Todas las Tipologías</option>
              <option value="Andina">Andina</option>
              <option value="Amazonica">Amazónica</option>
              <option value="VallesCosteros">Valles Costeros</option>
              <option value="AridaSecano">Árida / Secano</option>
              <option value="GranChaco">Gran Chaco</option>
              <option value="PampeanaPatagonia">Pampeana / Patagonia</option>
            </select>
          </div>
        </div>

        {/* Microdata Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">ID Hogar</th>
                <th className="py-2.5 px-3">País</th>
                <th className="py-2.5 px-3">Región / Territorio</th>
                <th className="py-2.5 px-3">Tipología</th>
                <th className="py-2.5 px-3 text-right">Factor Exp.</th>
                <th className="py-2.5 px-3 text-right">Integrantes</th>
                <th className="py-2.5 px-3 text-right">Menores</th>
                <th className="py-2.5 px-3 text-right">Tierra (ha)</th>
                <th className="py-2.5 px-3 text-right">Consumo USD PPP</th>
                <th className="py-2.5 px-3 text-center">Estado Pobreza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {paginatedRecords.map((hh) => (
                <tr key={hh.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-cyan-600 dark:text-cyan-400">{hh.id}</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{hh.countryCode}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-800 dark:text-slate-200">{hh.regionName}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">{hh.typology}</td>
                  <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums">{hh.expansionFactor}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">{hh.householdSize}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">{hh.numChildren}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">{hh.landHectares}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">${hh.simulatedConsumptionPerCapita}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                      hh.simulatedPovertyStatus === 'extreme' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' :
                      hh.simulatedPovertyStatus === 'moderate' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                      'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {hh.simulatedPovertyStatus === 'extreme' ? 'Extrema' :
                       hh.simulatedPovertyStatus === 'moderate' ? 'Moderada' : 'No Pobre'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, filteredRecords.length)} de {filteredRecords.length} registros filtrados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 rounded"
            >
              Anterior
            </button>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 rounded"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
