import { create } from 'zustand';

interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  netAssets: number;
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
}

interface ReportStoreState {
  // Financial summary - shared across reports
  summary: FinancialSummary;
  
  // Actions
  setTotalAssets: (value: number) => void;
  setTotalLiabilities: (value: number) => void;
  setNetAssets: (value: number) => void;
  setTotalCurrentAssets: (value: number) => void;
  setTotalNonCurrentAssets: (value: number) => void;
  setTotalCurrentLiabilities: (value: number) => void;
  setTotalNonCurrentLiabilities: (value: number) => void;
  
  // Calculate derived values
  calculateNetAssets: () => void;
  
  // Reset store to initial state
  reset: () => void;
}

const initialState: FinancialSummary = {
  totalAssets: 0,
  totalLiabilities: 0,
  netAssets: 0,
  totalCurrentAssets: 0,
  totalNonCurrentAssets: 0,
  totalCurrentLiabilities: 0,
  totalNonCurrentLiabilities: 0,
};

export const useReportStore = create<ReportStoreState>((set, get) => ({
  // Initial state
  summary: initialState,
  
  // Actions
  setTotalAssets: (value: number) => set(state => ({ 
    summary: { ...state.summary, totalAssets: value } 
  })),
  
  setTotalLiabilities: (value: number) => set(state => ({ 
    summary: { ...state.summary, totalLiabilities: value } 
  })),
  
  setNetAssets: (value: number) => set(state => ({ 
    summary: { ...state.summary, netAssets: value } 
  })),
  
  setTotalCurrentAssets: (value: number) => set(state => ({ 
    summary: { ...state.summary, totalCurrentAssets: value } 
  })),
  
  setTotalNonCurrentAssets: (value: number) => set(state => ({ 
    summary: { ...state.summary, totalNonCurrentAssets: value } 
  })),
  
  setTotalCurrentLiabilities: (value: number) => set(state => ({ 
    summary: { ...state.summary, totalCurrentLiabilities: value } 
  })),
  
  setTotalNonCurrentLiabilities: (value: number) => set(state => ({ 
    summary: { ...state.summary, totalNonCurrentLiabilities: value } 
  })),
  
  // Derived calculations
  calculateNetAssets: () => {
    const { totalAssets, totalLiabilities } = get().summary;
    set(state => ({ 
      summary: { ...state.summary, netAssets: totalAssets - totalLiabilities } 
    }));
  },
  
  // Reset store to initial state
  reset: () => set({ summary: initialState }),
})); 