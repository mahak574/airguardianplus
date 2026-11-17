import React from 'react';
import { Wind, Heart, Shield, Cpu, Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-canvas-border bg-canvas-card/60 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest-700 text-canvas-card flex items-center justify-center">
              <Wind className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <p className="text-xs font-bold text-forest-900 font-serif">AirGuardian+ Platform</p>
              <p className="text-[11px] text-charcoal-400">
                Built by Mahak Singh | B.Tech CSE | DCRUST '27
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-4 text-xs text-charcoal-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-forest-600" />
              OpenWeatherMap API
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-terracotta-500" />
              Linear Regression (scikit-learn)
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amberwarm-500" />
              US EPA Breakpoints
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
