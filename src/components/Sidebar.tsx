import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Eye,
  FileText,
  Layers,
  GitCompare,
  Upload,
  RefreshCw,
} from 'lucide-react'
import { useState } from 'react'
import { useDataStore } from '../data/store'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/observations', icon: Eye, label: 'Observações' },
  { to: '/needs', icon: FileText, label: 'Needs Stage 0' },
  { to: '/categories', icon: Layers, label: 'Categorias' },
  { to: '/compare', icon: GitCompare, label: 'Comparar' },
  { to: '/data', icon: Upload, label: 'Dados' },
]

interface SidebarProps {
  onRefresh?: () => Promise<void>
}

export function Sidebar({ onRefresh }: SidebarProps) {
  const [spinning, setSpinning] = useState(false)
  const lastUpdate = useDataStore((s) => s.lastUpdate)

  async function handleRefresh() {
    if (!onRefresh || spinning) return
    setSpinning(true)
    try {
      await onRefresh()
    } finally {
      setSpinning(false)
    }
  }

  return (
    <aside className="w-60 bg-sidebar text-white flex flex-col h-full shrink-0">
      <div className="p-5 border-b border-white/10">
        <h1 className="text-base font-bold tracking-tight">Biodesign</h1>
        <p className="text-xs text-slate-400 mt-0.5">Needs · Pediatria</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-active text-white'
                  : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          onClick={handleRefresh}
          disabled={spinning}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-sidebar-hover hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={spinning ? 'animate-spin' : ''} />
          {spinning ? 'Sincronizando...' : 'Sincronizar Sheets'}
        </button>
        {lastUpdate && (
          <p className="text-[10px] text-slate-500 text-center">
            Sync: {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
        <p className="text-[10px] text-slate-500 text-center">
          Stanford Biodesign Method
        </p>
      </div>
    </aside>
  )
}
