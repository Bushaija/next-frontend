import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export type OnboardingData = {
    name: string
    email: string
    province: string
    district: string
    hospital: string
}

type OnboardingStatus = {
    isCompleted: boolean
    completedAt: string | null
}

type OnboardingState = OnboardingData & OnboardingStatus & {
    // Actions
    setOnboardingData: (data: Partial<OnboardingData>) => void
    completeOnboarding: () => void
    clearOnboarding: () => void
}

// Initial state
const initialState: OnboardingData & OnboardingStatus = {
    name: '',
    email: '',
    province: '',
    district: '',
    hospital: '',
    isCompleted: false,
    completedAt: null
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            ...initialState,

            setOnboardingData: (data) => set((state) => ({
                ...state,
                ...data
            })),

            completeOnboarding: () => set((state) => ({
                ...state,
                isCompleted: true,
                completedAt: new Date().toISOString()
            })),

            clearOnboarding: () => set(initialState)
        }),
        {
            name: 'riwa-onboarding',
            // Persist everything except the actions
            partialize: (state) => ({
                name: state.name,
                email: state.email,
                province: state.province,
                district: state.district,
                hospital: state.hospital,
                isCompleted: state.isCompleted,
                completedAt: state.completedAt
            })
        }
    )
)
