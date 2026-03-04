import { DiagnosisResponse, HistoryItem } from '../types';

const STORAGE_KEY = 'cropguard_history';

export const saveDiagnosisToHistory = (diagnosis: DiagnosisResponse): HistoryItem => {
  const history = getHistory();
  const newItem: HistoryItem = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    diagnosis
  };
  
  // Add to beginning of list
  const updatedHistory = [newItem, ...history];
  
  // Limit to last 50 items to prevent storage overflow
  if (updatedHistory.length > 50) {
    updatedHistory.length = 50;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  return newItem;
};

export const getHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse history", e);
    return [];
  }
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};