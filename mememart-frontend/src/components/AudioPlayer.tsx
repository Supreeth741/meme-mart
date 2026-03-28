'use client';

import { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export default function AudioPlayer({ src, className = '' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // Update progress bar during playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isSeeking]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handleAgain = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleProgressStart = () => {
    setIsSeeking(true);
  };

  const handleProgressEnd = () => {
    setIsSeeking(false);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex flex-col items-center gap-3 sm:gap-4 w-full ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />
      
      {/* Button Controls - Responsive sizing */}
      <div className="flex gap-2 sm:gap-3 items-center">
        <button
          onClick={handlePlay}
          disabled={isPlaying}
          className={`flex items-center justify-center rounded-full p-2 sm:p-3 transition-all duration-200 shrink-0 ${
            isPlaying
              ? 'bg-slate-600/40 text-slate-400 cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90 text-background-dark active:scale-95'
          }`}
          aria-label="Play audio"
          title="Play"
        >
          <span className="material-symbols-outlined text-xl sm:text-2xl">play_arrow</span>
        </button>

        <button
          onClick={handleStop}
          disabled={!isPlaying}
          className={`flex items-center justify-center rounded-full p-2 sm:p-3 transition-all duration-200 shrink-0 ${
            !isPlaying
              ? 'bg-slate-600/40 text-slate-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
          }`}
          aria-label="Stop audio"
          title="Stop"
        >
          <span className="material-symbols-outlined text-xl sm:text-2xl">stop</span>
        </button>

        <button
          onClick={handleAgain}
          className="flex items-center justify-center rounded-full p-2 sm:p-3 bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200 active:scale-95 shrink-0"
          aria-label="Play again"
          title="Play Again"
        >
          <span className="material-symbols-outlined text-xl sm:text-2xl">refresh</span>
        </button>
      </div>

      {/* Progress Bar with Time */}
      <div className="w-full px-2 sm:px-0">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgressChange}
          onMouseDown={handleProgressStart}
          onMouseUp={handleProgressEnd}
          onTouchStart={handleProgressStart}
          onTouchEnd={handleProgressEnd}
          className="w-full h-1 sm:h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary hover:h-1.5 sm:hover:h-2 transition-all"
          aria-label="Audio progress"
        />
        
        {/* Time Display */}
        <div className="flex justify-between items-center mt-2 text-xs sm:text-sm text-slate-400 px-0 sm:px-0">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
