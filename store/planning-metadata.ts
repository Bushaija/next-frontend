import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PlanningMetadata = {
  selectedProgram: string | null
  selectedFiscalYear: string | null
  facilityName: string | null
  facilityType: string | null
  facilityDistrict: string | null
}

type PlanningMetadataState = PlanningMetadata & {
  setSelectedProgram: (program: string) => void
  setSelectedFiscalYear: (fiscalYear: string) => void
  setFacility: (name: string, type: string, district: string) => void
  clearPlanningMetadata: () => void
}

const initialState: PlanningMetadata = {
  selectedProgram: null,
  selectedFiscalYear: null,
  facilityName: null,
  facilityType: null,
  facilityDistrict: null
}

export const usePlanningMetadataStore = create<PlanningMetadataState>()(
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

      setFacility: (name, type, district) => set((state) => ({
        ...state,
        facilityName: name,
        facilityType: type,
        facilityDistrict: district
      })),

      clearPlanningMetadata: () => set(initialState)
    }),
    {
      name: 'riwa-planning-metadata',
      partialize: (state) => ({
        selectedProgram: state.selectedProgram,
        selectedFiscalYear: state.selectedFiscalYear,
        facilityName: state.facilityName,
        facilityType: state.facilityType,
        facilityDistrict: state.facilityDistrict
      })
    }
  )
)
