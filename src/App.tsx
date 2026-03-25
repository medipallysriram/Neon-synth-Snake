/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';
import { Terminal } from 'lucide-react';

export default function App() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-black text-cyan font-sans overflow-hidden relative selection:bg-magenta selection:text-black">
      {/* CRT Effects */}
      <div className="absolute inset-0 bg-static pointer-events-none z-50" />
      <div className="absolute inset-0 scanlines pointer-events-none z-40" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col glitch-box">
        {/* Header */}
        <header className="flex items-center justify-between mb-12 border-b-2 border-cyan pb-4">
          <div className="flex items-center gap-4">
            <Terminal className="w-10 h-10 text-magenta animate-pulse" />
            <div className="flex flex-col">
              <h1 className="text-4xl font-display text-cyan-glow tracking-widest uppercase">
                SYS.ERR // OVERRIDE
              </h1>
              <span className="text-magenta text-[10px] font-pixel mt-2 uppercase tracking-widest">
                UNAUTHORIZED_ACCESS_DETECTED
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-magenta font-pixel tracking-widest uppercase mb-2">
              DATA_HARVESTED
            </span>
            <span 
              className="text-7xl font-sans text-cyan-glow glitch-text leading-none"
              data-text={score.toString().padStart(4, '0')}
            >
              {score.toString().padStart(4, '0')}
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
          {/* Game Container */}
          <div className="flex-1 flex justify-center w-full max-w-2xl">
            <SnakeGame onScoreChange={setScore} />
          </div>

          {/* Player Container */}
          <div className="w-full lg:w-auto flex justify-center">
            <MusicPlayer />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="mt-12 text-center text-cyan text-[10px] font-pixel tracking-widest border-t-2 border-magenta pt-4">
          TERMINAL_ID: 0x8F9A // CONNECTION_UNSTABLE
        </footer>
      </div>
    </div>
  );
}
