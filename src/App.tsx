import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, RefreshCw, Share2, Trophy } from 'lucide-react';

const sampleText = "The quick brown fox jumps over the lazy dog.";

interface TestStats {
  wpm: number;
  accuracy: number;
  time: number;
}

function App() {
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number>();

  const calculateStats = useCallback(() => {
    if (startTime && endTime) {
      const timeInMinutes = (endTime - startTime) / 60000;
      const wordsTyped = input.trim().split(/\s+/).length;
      const wpm = Math.round(wordsTyped / timeInMinutes);

      const correctChars = input.split('').filter((char, index) => char === sampleText[index]).length;
      const accuracy = Math.round((correctChars / sampleText.length) * 100);

      setStats({
        wpm,
        accuracy,
        time: Math.round(timeInMinutes * 60)
      });
    }
  }, [input, startTime, endTime]);

  useEffect(() => {
    if (startTime && !endTime) {
      timerRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, endTime]);

  useEffect(() => {
    if (input.length === sampleText.length) {
      setEndTime(Date.now());
      setIsTestComplete(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [input]);

  useEffect(() => {
    if (isTestComplete) {
      calculateStats();
    }
  }, [isTestComplete, calculateStats]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!startTime && e.target.value.length > 0) {
      setStartTime(Date.now());
    }
    setInput(e.target.value.slice(0, sampleText.length));
  };

  const resetTest = () => {
    setInput('');
    setStartTime(null);
    setEndTime(null);
    setStats(null);
    setIsTestComplete(false);
    setTimer(0);
    inputRef.current?.focus();
  };

  const shareToFarcaster = async () => {
    if (!stats) return;

    const text = `🏃‍♂️ Just completed a typing test!\n\n⚡️ WPM: ${stats.wpm}\n🎯 Accuracy: ${stats.accuracy}%\n⏱️ Time: ${stats.time}s\n\nCan you beat my score? Try it now!`;
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Typing Speed Test</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <Timer size={20} />
            <span className="font-mono text-xl">{formatTime(timer)}</span>
          </div>
        </div>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700 leading-relaxed font-mono text-lg">
            {sampleText.split('').map((char, index) => (
              <span
                key={index}
                className={
                  index < input.length
                    ? input[index] === char
                      ? 'text-green-600'
                      : 'text-red-600'
                    : ''
                }
              >
                {char}
              </span>
            ))}
          </p>
        </div>

        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-6 h-32 resize-none font-mono"
          placeholder="Start typing..."
          disabled={isTestComplete}
          autoFocus
        />

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-indigo-50 p-4 rounded-lg text-center">
              <p className="text-sm text-indigo-600 mb-1">WPM</p>
              <p className="text-2xl font-bold text-indigo-800">{stats.wpm}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-green-600 mb-1">Accuracy</p>
              <p className="text-2xl font-bold text-green-800">{stats.accuracy}%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm text-purple-600 mb-1">Time</p>
              <p className="text-2xl font-bold text-purple-800">{stats.time}s</p>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={resetTest}
            className="flex items-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            Reset
          </button>
          {stats && (
            <>
              <button
                onClick={shareToFarcaster}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Share2 size={18} />
                Share to Farcaster
              </button>
              <button
                onClick={() => {
                  // TODO: Implement challenge functionality
                  alert('Challenge feature coming soon!');
                }}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Trophy size={18} />
                Challenge Friend
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;