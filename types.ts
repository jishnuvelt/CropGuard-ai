export interface DiagnosisResponse {
  isPlant: boolean;
  plantName: string;
  condition: "Healthy" | "Diseased" | "Pest Infestation" | "Nutrient Deficiency" | "Unknown";
  diseaseName?: string;
  confidence: number;
  description: string;
  symptoms: string[];
  treatments: string[];
  preventativeMeasures: string[];
  // Extended info for "More Information" section
  scientificName?: string;
  severity?: "Low" | "Moderate" | "High";
  favorableConditions?: string;
  spreadMethod?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  diagnosis: DiagnosisResponse;
}

export enum AppView {
  HOME = 'HOME',
  DIAGNOSIS = 'DIAGNOSIS',
  EXPERTS = 'EXPERTS',
  HISTORY = 'HISTORY'
}