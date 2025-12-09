import React, { useState } from 'react';
import { ImageGenerationPanelProps, ThemeMode } from '../types';
import { Wand2, Download, AlertCircle, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

export const ImageGenerationPanel: React.FC<ImageGenerationPanelProps> = ({ onGenerateImage, theme }) => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const isDark = theme === ThemeMode.DARK;

  const handleGenerateClick = async () => {
    setError(null);
    setIsGenerating(true);
    // Don't clear previous image immediately so user sees context, or clear if you prefer
    // setGeneratedImage(null); 

    try {
      const result = await onGenerateImage(customPrompt);
      if (result) {
        setGeneratedImage(result);
        if (!isOpen) setIsOpen(true);
      }
    } catch (err: any) {
      console.error("Panel caught error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadResult = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `banana-magic-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <>
      {/* Toggle Button for Mobile/Desktop */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          absolute top-4 right-4 z-20 p-2 rounded-full shadow-lg transition-transform md:hidden
          ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
        `}
      >
        {isOpen ? <ChevronRight /> : <ChevronLeft />}
      </button>

      <div 
        className={`
          relative z-10 w-full md:w-[400px] border-l flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full hidden md:flex md:w-0 md:opacity-0 md:overflow-hidden'}
          ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-yellow-100'}
        `}
      >
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          {/* Header Section */}
          <div>
            <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              <Wand2 className="text-yellow-500" />
              Magic Maker
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Turn your sketch into a masterpiece.
            </p>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold uppercase mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Custom Instructions (Optional)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. A blue robot in space..."
                className={`
                  w-full p-3 rounded-xl border text-sm resize-none h-24 focus:ring-2 focus:ring-yellow-400 focus:outline-none
                  ${isDark 
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-600' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}
                `}
              />
            </div>

            <button
              onClick={handleGenerateClick}
              disabled={isGenerating}
              className={`
                w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all active:scale-[0.98]
                flex items-center justify-center gap-2
                ${isGenerating 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white shadow-orange-500/30'
                }
              `}
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <Wand2 size={20} />
                  Make Magic!
                </>
              )}
            </button>
          </div>

          {/* Results Area */}
          <div className={`
            flex-1 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden min-h-[300px]
            ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}
          `}>
            {isGenerating && (
               <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                 <LoadingSpinner />
               </div>
            )}
            
            {!isGenerating && !generatedImage && !error && (
              <div className="text-center p-6 opacity-40">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center dark:bg-gray-700">
                   <Wand2 size={32} />
                </div>
                <p>Your magic picture will appear here</p>
              </div>
            )}

            {!isGenerating && error && (
              <div className="text-center p-6 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl m-4">
                <AlertCircle size={32} className="mx-auto mb-2 opacity-80" />
                <p className="font-bold text-sm mb-1">Oops!</p>
                <p className="text-xs opacity-90 break-words">{error}</p>
                <button 
                  onClick={handleGenerateClick}
                  className="mt-4 text-xs font-semibold px-4 py-2 bg-red-100 dark:bg-red-800 rounded-full hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            )}

            {generatedImage && (
              <div className="relative w-full h-full group">
                <img 
                  src={generatedImage} 
                  alt="Generated Magic" 
                  className="w-full h-full object-contain p-2"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                   <button 
                    onClick={handleDownloadResult}
                    className="p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform shadow-xl"
                    title="Download"
                   >
                     <Download size={24} />
                   </button>
                   <button 
                    onClick={handleGenerateClick}
                    className="p-3 bg-yellow-400 text-white rounded-full hover:scale-110 transition-transform shadow-xl"
                    title="Regenerate"
                   >
                     <RefreshCw size={24} />
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};