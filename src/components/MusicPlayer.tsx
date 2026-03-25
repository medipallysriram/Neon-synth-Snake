import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { TRACKS } from '../constants';

export function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const percentage = x / bounds.width;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
      setProgress(percentage * 100);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md bg-black border-glitch p-6 relative">
      {/* Decorative corner markers */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-magenta" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-magenta" />
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      
      <div className="flex items-center gap-4 mb-6 border-b border-cyan pb-4">
        <div className="w-16 h-16 bg-black border-2 border-magenta flex items-center justify-center shrink-0 animate-pulse">
          <AlertTriangle className="w-8 h-8 text-magenta" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-cyan font-pixel text-[10px] truncate leading-relaxed mb-2 uppercase">
            {currentTrack.title}
          </h3>
          <p className="text-magenta font-sans text-lg truncate uppercase">ID: {currentTrack.artist}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div 
        className="h-4 w-full bg-black border-2 border-cyan mb-6 cursor-pointer relative"
        onClick={handleProgressClick}
      >
        <div className="absolute inset-0 bg-static opacity-30 pointer-events-none" />
        <div 
          className="h-full bg-magenta transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMuted(!isMuted)} className="text-cyan hover:text-magenta transition-colors">
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="w-20 accent-magenta"
          />
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrev}
            className="p-2 text-cyan hover:text-magenta transition-colors border border-transparent hover:border-cyan"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-12 h-12 flex items-center justify-center bg-black border-2 border-cyan text-cyan hover:bg-cyan hover:text-black transition-colors"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
          
          <button 
            onClick={handleNext}
            className="p-2 text-cyan hover:text-magenta transition-colors border border-transparent hover:border-cyan"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
