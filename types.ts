export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark'
}

export interface GenerateImageOptions {
  imageData: string;       // Base64 encoded string with data prefix
  customPrompt?: string;   // Optional custom prompt override
}

export interface GenerateImageResult {
  success: boolean;
  imageBase64?: string;    // Resulting image in Base64
  error?: string;
}

export interface ImageGenerationPanelProps {
  onGenerateImage: (customPrompt?: string) => Promise<string | null>;
  theme: ThemeMode;
}

export interface HeaderProps {
  theme: ThemeMode;
  toggleTheme: () => void;
  onClear: () => void;
  onExport: () => void;
}
