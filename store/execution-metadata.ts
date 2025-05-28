import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ExecutionMetadata = {
  selectedProgram: string | null
  selectedFiscalYear: string | null
  selectedQuarter: string | null
  facilityName: string | null
  facilityType: string | null
  facilityDistrict: string | null
}

type ExecutionMetadataState = ExecutionMetadata & {
  setSelectedProgram: (program: string) => void
  setSelectedFiscalYear: (fiscalYear: string) => void
  setSelectedQuarter: (quarter: string) => void
  setFacility: (name: string, type: string, district: string) => void
  clearExecutionMetadata: () => void
}

const initialState: ExecutionMetadata = {
  selectedProgram: null,
  selectedFiscalYear: null,
  selectedQuarter: null,
  facilityName: null,
  facilityType: null,
  facilityDistrict: null
}

export const useExecutionMetadataStore = create<ExecutionMetadataState>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedProgram: (program) => set((state) => ({
        ...state,
        selectedProgram: program
      })),

      setSelectedFiscalYear: (fiscalYear) => set((state) => ({
        ...state,
        selectedFiscalYear: fiscalYear
      })),

      setSelectedQuarter: (quarter) => set((state) => ({
        ...state,
        selectedQuarter: quarter
      })),

      setFacility: (name, type, district) => set((state) => ({
        ...state,
        facilityName: name,
        facilityType: type,
        facilityDistrict: district
      })),

      clearExecutionMetadata: () => set(initialState)
    }),
    {
      name: 'riwa-execution-metadata',
      partialize: (state) => ({
        selectedProgram: state.selectedProgram,
        selectedFiscalYear: state.selectedFiscalYear,
        selectedQuarter: state.selectedQuarter,
        facilityName: state.facilityName,
        facilityType: state.facilityType,
        facilityDistrict: state.facilityDistrict
      })
    }
  )
) 