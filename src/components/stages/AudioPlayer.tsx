import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, RefreshCw, ArrowRight, Loader2, Volume2, FileAudio } from 'lucide-react';
import { AudioContent } from '../../types/project.types';
import { toast } from 'react-toastify';

interface AudioPlayerProps {
  audio: AudioContent | null;
  isLoading: boolean;
  onRegenerate: () => Promise<void>;
  onContinue: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audio,
  isLoading,
  onRegenerate,
  onContinue,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const updateTime = () => setCurrentTime(audioElement.currentTime);
    const updateDuration = () => setDuration(audioElement.duration);
    const handleEnded = () => setIsPlaying(false);

    audioElement.addEventListener('timeupdate', updateTime);
    audioElement.addEventListener('loadedmetadata', updateDuration);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('timeupdate', updateTime);
      audioElement.removeEventListener('loadedmetadata', updateDuration);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audio]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Audio playback failed:', error);
        toast.error('Audio playback failed. The audio file may have expired or been cleared from memory.');
        setIsPlaying(false);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleDownload = () => {
    if (!audio) return;

    try {
      const a = document.createElement('a');
      a.href = audio.audioUrl;
      a.download = `podcast-audio-${Date.now()}.${audio.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Audio downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. The audio file may no longer be available.');
    }
  };

  if (isLoading && !audio) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating audio...</p>
        </div>
      </div>
    );
  }

  if (!audio) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No audio available</p>
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Generate Audio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audio Content</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <FileAudio className="w-4 h-4" />
              {audio.format.toUpperCase()}
            </span>
            <span className="flex items-center gap-1">
              <Volume2 className="w-4 h-4" />
              {formatFileSize(audio.size)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Regenerate
          </button>
          <button
            onClick={onContinue}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue to Images
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <audio ref={audioRef} src={audio.audioUrl} className="hidden" />
        
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <button
              onClick={togglePlayPause}
              className="w-20 h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #2563eb ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Duration: {audio.duration} minutes</p>
          </div>

          {/* Audio Success Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800 text-sm font-medium mb-2">
              <FileAudio className="w-4 h-4" />
              Audio Generated Successfully!
            </div>
            <p className="text-green-700 text-sm">
              Audio was generated using Google Cloud Text-to-Speech API. 
              You can play, pause, and download the audio file.
            </p>
          </div>
        </div>
      </div>

      {/* Transcript Section */}
      {audio.transcript && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Podcast Transcript</h3>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
              {audio.transcript}
            </pre>
          </div>
        </div>
      )}

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #2563eb;
          cursor: pointer;
          border-radius: 50%;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #2563eb;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
};