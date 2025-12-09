import React from 'react';
import { ThemeMode, HeaderProps } from '../types';
import { Moon, Sun, Trash2, Download, Banana } from 'lucide-react';

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onClear, onExport }) => {
  const isDark = theme === ThemeMode.DARK;

  return (
    <header className={`
      h-16 px-6 flex items-center justify-between border-b shadow-sm z-10 transition-colors duration-300
      ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-yellow-50 border-yellow-200 text-gray-800'}
    `}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-200'}`}>
          <Banana size={24} className="text-yellow-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Excali Banana</h1>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Draw, Dream, Generate
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-lg transition-all active:scale-95
            ${isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' 
              : 'bg-white hover:bg-yellow-100 text-gray-600 border border-yellow-200 shadow-sm'
            }`}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className={`h-8 w-px mx-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />

        <button
          onClick={onClear}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-95
            ${isDark 
              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' 
              : 'bg-white hover:bg-red-50 text-red-600 border border-red-100 shadow-sm'
            }
          `}
        >
          <Trash2 size={18} />
          <span className="hidden sm:inline">Clear</span>
        </button>

        <button
          onClick={onExport}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-95
            ${isDark
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
            }
          `}
        >
          <Download size={18} />
          <span className="hidden sm:inline">Export PNG</span>
        </button>
      </div>
    </header>
  );
};