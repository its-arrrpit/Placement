'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Compass, Sun, Moon, Search, X } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface NavbarProps {
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
  search?: string;
  onSearchChange?: (val: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  isRefreshing = false,
  search = '',
  onSearchChange,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(search));
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (search && !isSearchOpen) {
      setIsSearchOpen(true);
    }
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        if (!search) {
          setIsSearchOpen(false);
        }
      }
    }

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen, search]);

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleCloseSearch = () => {
    onSearchChange?.('');
    setIsSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (!search) {
        setIsSearchOpen(false);
      } else {
        onSearchChange?.('');
      }
    } else if (e.key === 'Enter') {
      const target =
        document.getElementById('company-search-input') ||
        document.getElementById('placements-content');
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0e131f]/95 backdrop-blur-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Operational Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
              <Compass className="w-4 h-4 text-blue-500 dark:text-blue-600" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight">
                Placement Terminal
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                2026
              </span>
            </div>
          </div>

          {/* Right Status Indicator & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Button / Interactive Input */}
            <div ref={containerRef} className="relative flex items-center">
              {isSearchOpen ? (
                <div className="relative flex items-center animate-in fade-in zoom-in-95 duration-150">
                  <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    ref={inputRef}
                    id="navbar-company-search"
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search companies..."
                    className="w-32 xs:w-44 sm:w-56 pl-8 pr-7 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all shadow-xs"
                    autoFocus
                  />
                  <button
                    onClick={handleCloseSearch}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    title={search ? 'Clear search' : 'Close search'}
                    aria-label="Clear or close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleOpenSearch}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors shadow-xs"
                  title="Search companies"
                  aria-label="Search companies"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              )}
            </div>

            {/* Sync Button */}
            <button
              onClick={() => onRefresh()}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-medium transition-colors disabled:opacity-50 shadow-xs"
              title="Sync with Google Sheet"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isRefreshing ? 'animate-spin text-blue-400 dark:text-blue-600' : ''
                }`}
              />
              <span className="hidden sm:inline">Sync Data</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              title={theme === 'dark' ? 'Switch to bright mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
