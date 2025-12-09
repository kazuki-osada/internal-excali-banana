import React, { useState, useCallback, useEffect, useRef } from 'react';
import * as ExcalidrawLib from '@excalidraw/excalidraw';
import { Header } from './components/Header';
import { ImageGenerationPanel } from './components/ImageGenerationPanel';
import { generateImageFromDrawing } from './utils/geminiApi';
import { ThemeMode } from './types';

// Robustly handle Excalidraw imports from CDN
const ExcalidrawModule = (ExcalidrawLib as any).default || ExcalidrawLib;
const Excalidraw = ExcalidrawModule.Excalidraw || ExcalidrawModule;

// Helper to find exportToBlob
const findExportToBlob = () => {
  if (ExcalidrawModule.exportToBlob) return ExcalidrawModule.exportToBlob;
  if ((ExcalidrawLib as any).exportToBlob) return (ExcalidrawLib as any).exportToBlob;
  if ((ExcalidrawLib as any).default?.exportToBlob) return (ExcalidrawLib as any).default?.exportToBlob;
  return null;
};

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function App() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [theme, setTheme] = useState<ThemeMode>(ThemeMode.LIGHT);
  const [isMounted, setIsMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const fn = findExportToBlob();
    if (!fn) {
      console.warn("Excalidraw exportToBlob function not found. Will use DOM canvas fallback.");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT));
  }, []);

  const handleClear = useCallback(() => {
    if (excalidrawAPI) {
      excalidrawAPI.resetScene();
    }
  }, [excalidrawAPI]);

  const handleExport = useCallback(async () => {
    if (!excalidrawAPI) return;
    const exportToBlob = findExportToBlob();
    
    try {
      const elements = excalidrawAPI.getSceneElements();
      if (!elements || elements.length === 0) return;

      let blob;
      if (exportToBlob) {
        blob = await exportToBlob({
          elements,
          mimeType: 'image/png',
          appState: {
            ...excalidrawAPI.getAppState(),
            exportWithDarkMode: theme === ThemeMode.DARK,
          },
          files: excalidrawAPI.getFiles(),
        });
      } else {
        // Fallback: Try to find canvas in DOM
        const canvas = wrapperRef.current?.querySelector('canvas');
        if (canvas) {
           blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        }
      }

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `excali-banana-${Date.now()}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image.');
    }
  }, [excalidrawAPI, theme]);

  const handleGenerateImage = useCallback(async (customPrompt?: string): Promise<string | null> => {
    if (!excalidrawAPI) {
      console.error("Excalidraw API is not ready");
      return null;
    }

    try {
      const elements = excalidrawAPI.getSceneElements();
      if (!elements || elements.length === 0) {
        alert("Please draw something first!");
        return null;
      }

      const exportToBlob = findExportToBlob();
      let blob: Blob | null = null;

      // Method 1: Try official exportToBlob
      if (exportToBlob) {
        try {
          console.log("Attempting export via exportToBlob...");
          blob = await exportToBlob({
            elements,
            mimeType: 'image/png',
            appState: {
              ...excalidrawAPI.getAppState(),
              exportWithDarkMode: false, // Light mode is usually better for AI
              viewBackgroundColor: '#ffffff',
            },
            files: excalidrawAPI.getFiles(),
          });
        } catch (e) {
          console.warn("exportToBlob failed, trying fallback...", e);
        }
      }

      // Method 2: Fallback to DOM canvas capture
      if (!blob && wrapperRef.current) {
        console.log("Attempting fallback via DOM canvas...");
        // Excalidraw usually has a static canvas class "excalidraw__canvas"
        const canvas = wrapperRef.current.querySelector('canvas.excalidraw__canvas') as HTMLCanvasElement 
                      || wrapperRef.current.querySelector('canvas');
        
        if (canvas) {
           blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        }
      }

      if (!blob) {
        throw new Error("Failed to capture drawing. Please try again.");
      }

      const base64Data = await blobToBase64(blob);
      console.log("Image captured, sending to Gemini...", base64Data.substring(0, 30) + "...");

      const result = await generateImageFromDrawing({
        imageData: base64Data,
        customPrompt,
      });

      if (result.success && result.imageBase64) {
        return result.imageBase64;
      } else {
        throw new Error(result.error || "Unknown generation error");
      }
    } catch (error) {
      console.error("Generation error in App:", error);
      throw error;
    }
  }, [excalidrawAPI]);

  if (!isMounted) return null;

  return (
    <div className={`flex flex-col h-screen w-full overflow-hidden ${theme === ThemeMode.DARK ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onClear={handleClear} 
        onExport={handleExport} 
      />
      
      <div className="flex-1 relative flex overflow-hidden">
        {/* Main Canvas Area */}
        <div className="flex-1 h-full relative z-0" ref={wrapperRef}>
          <Excalidraw
            excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
            theme={theme}
            initialData={{
              appState: {
                viewBackgroundColor: theme === ThemeMode.DARK ? '#1f2937' : '#ffffff',
                currentItemStrokeColor: theme === ThemeMode.DARK ? '#ffffff' : '#000000',
              }
            }}
            UIOptions={{
              canvasActions: {
                loadScene: false,
                saveToActiveFile: false,
                toggleTheme: false,
                saveAsImage: false,
                export: false,
              }
            }}
          />
        </div>

        {/* Right Sidebar Panel */}
        <ImageGenerationPanel onGenerateImage={handleGenerateImage} theme={theme} />
      </div>
    </div>
  );
}