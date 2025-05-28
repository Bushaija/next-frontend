import { create } from 'zustand';

interface CashFlowSummary {
  cashFromOperations: number;
  cashFromInvesting: number;
  cashFromFinancing: number;
  netChange: number;
  openingBalance: number;
  closingBalance: number;
}

interface CashFlowStoreState {
  // Financial summary - shared across reports
  summary: CashFlowSummary;
  
  // Actions
  setCashFromOperations: (value: number) => void;
  setCashFromInvesting: (value: number) => void;
  setCashFromFinancing: (value: number) => void;
  setOpeningBalance: (value: number) => void;
  setClosingBalance: (value: number) => void;
  
  // Calculate derived values
  calculateNetChange: () => void;
  
  // Reset store to initial state
  reset: () => void;
}

const initialState: CashFlowSummary = {
  cashFromOperations: 0,
  cashFromInvesting: 0,
  cashFromFinancing: 0,
  netChange: 0,
  openingBalance: 0,
  closingBalance: 0,
};

export const useCashFlowStore = create<CashFlowStoreState>((set, get) => ({
  // Initial state
  summary: initialState,
  
  // Actions
  setCashFromOperations: (value: number) => set(state => ({ 
    summary: { ...state.summary, cashFromOperations: value } 
  })),
  
  setCashFromInvesting: (value: number) => set(state => ({ 
    summary: { ...state.summary, cashFromInvesting: value } 
  })),
  
  setCashFromFinancing: (value: number) => set(state => ({ 
    summary: { ...state.summary, cashFromFinancing: value } 
  })),
  
  setOpeningBalance: (value: number) => set(state => ({ 
    summary: { ...state.summary, openingBalance: value } 
  })),
  
  setClosingBalance: (value: number) => set(state => ({ 
    summary: { ...state.summary, closingBalance: value } 
  })),
  
  // Derived calculations
  calculateNetChange: () => {
    const { cashFromOperations, cashFromInvesting, cashFromFinancing } = get().summary;
    set(state => ({ 
      summary: { 
        ...state.summary, 
        netChange: cashFromOperations + cashFromInvesting + cashFromFinancing
      } 
    }));
  },
  
  // Reset store to initial state
  reset: () => set({ summary: initialState }),
})); 