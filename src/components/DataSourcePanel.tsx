import { useState, useCallback } from 'react'
import { Upload, Link, RefreshCw, Check, AlertCircle, FileSpreadsheet } from 'lucide-react'
import { useDataStore } from '../data/store'
import { parseXlsxFile } from '../data/xlsxLoader'
import { loadFromSheets } from '../data/sheetsLoader'

export function DataSourcePanel() {
  const {
    observations,
    needs,
    sheetsConfig,
    setSheetsConfig,
    setObservations,
    setNeeds,
    mergeObservations,
    mergeNeeds,
    setLoading,
    isLoading,
    lastUpdate,
  } = useDataStore()

  const [sheetUrl, setSheetUrl] = useState(sheetsConfig.spreadsheetUrl)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState('')
  const [mergeMode, setMergeMode] = useState(true)

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setLoading(true)
      setUploadStatus('idle')

      try {
        const result = await parseXlsxFile(file)

        if (mergeMode) {
          if (result.observations.length > 0) mergeObservations(result.observations)
          if (result.needs.length > 0) mergeNeeds(result.needs)
        } else {
          if (result.observations.length > 0) setObservations(result.observations)
          if (result.needs.length > 0) setNeeds(result.needs)
        }

        setUploadStatus('success')
        setUploadMessage(
          `${result.observations.length} observações e ${result.needs.length} needs carregadas`
        )
      } catch (err) {
        setUploadStatus('error')
        setUploadMessage(err instanceof Error ? err.message : 'Erro ao processar arquivo')
      } finally {
        setLoading(false)
        e.target.value = ''
      }
    },
    [mergeMode, mergeObservations, mergeNeeds, setObservations, setNeeds, setLoading]
  )

  const handleLoadSheets = async () => {
    setSheetsConfig({ spreadsheetUrl: sheetUrl })
    setLoading(true)
    setUploadStatus('idle')

    try {
      const result = await loadFromSheets(sheetUrl)

      if (mergeMode) {
        if (result.observations.length > 0) mergeObservations(result.observations)
        if (result.needs.length > 0) mergeNeeds(result.needs)
      } else {
        if (result.observations.length > 0) setObservations(result.observations)
        if (result.needs.length > 0) setNeeds(result.needs)
      }

      setUploadStatus('success')
      setUploadMessage(
        `Sheets: ${result.observations.length} observações + ${result.needs.length} needs`
      )
    } catch (err) {
      setUploadStatus('error')
      setUploadMessage(err instanceof Error ? err.message : 'Erro ao carregar do Google Sheets')
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        const input = document.createElement('input')
        input.type = 'file'
        const dt = new DataTransfer()
        dt.items.add(file)
        input.files = dt.files
        handleFileUpload({ target: input } as unknown as React.ChangeEvent<HTMLInputElement>)
      }
    },
    [handleFileUpload]
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fonte de Dados</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload de arquivo .xlsx ou conecte ao Google Sheets
        </p>
      </div>

      {/* Status atual */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Status Atual</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">{observations.length}</p>
            <p className="text-xs text-slate-500">Observações</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">{needs.length}</p>
            <p className="text-xs text-slate-500">Needs</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">
              {lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
            </p>
            <p className="text-xs text-slate-500">Última atualização</p>
          </div>
        </div>
      </div>

      {/* Modo merge */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={mergeMode}
            onChange={(e) => setMergeMode(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600"
          />
          <span className="text-sm font-medium text-amber-800">Modo merge</span>
        </label>
        <span className="text-xs text-amber-600">
          {mergeMode
            ? 'Novos dados serão adicionados sem duplicar'
            : 'Novos dados substituirão os existentes'}
        </span>
      </div>

      {/* Upload */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
      >
        <FileSpreadsheet size={40} className="mx-auto text-slate-400 mb-3" />
        <p className="text-sm font-medium text-slate-700 mb-1">
          Arraste um arquivo .xlsx aqui
        </p>
        <p className="text-xs text-slate-400 mb-4">ou clique para selecionar</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
          <Upload size={16} />
          Selecionar arquivo
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Google Sheets */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Link size={16} />
          Google Sheets
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">
              URL da planilha
            </label>
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
            <p className="text-[11px] font-medium text-slate-600">Como conectar:</p>
            <ol className="text-[11px] text-slate-500 list-decimal list-inside space-y-0.5">
              <li>Abra sua planilha no Google Sheets</li>
              <li>Clique em <strong>Compartilhar</strong> &rarr; <strong>Qualquer pessoa com o link pode ver</strong></li>
              <li>Copie a URL da barra de endereço e cole acima</li>
            </ol>
            <p className="text-[11px] text-slate-400 mt-1">
              As abas devem se chamar <strong>Observacoes</strong> e <strong>Needs Stage 0</strong>
            </p>
          </div>
          <button
            onClick={handleLoadSheets}
            disabled={isLoading || !sheetUrl}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Carregar do Sheets
          </button>
        </div>
      </div>

      {/* Feedback */}
      {uploadStatus !== 'idle' && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            uploadStatus === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {uploadStatus === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {uploadMessage}
        </div>
      )}
    </div>
  )
}
