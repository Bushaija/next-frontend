'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProgramType, getHospitalDistrict } from '@/constants/facilities';

type UserSessionState = {
  hospital: string | null;
  district: string | null;
  program: ProgramType | null; // Primary program (first selected one)
  programs: ProgramType[]; // All selected programs
  facilities: string[];
  setSession: (hospital: string, primaryProgram: ProgramType, facilities: string[], allPrograms?: ProgramType[]) => void;
  clearSession: () => void;
};

export const useUserSession = create<UserSessionState>()(
  persist(
    (set) => ({
      hospital: null,
      district: null,
      program: null,
      programs: [],
      facilities: [],
      setSession: (hospital, primaryProgram, facilities, allPrograms = [primaryProgram]) =>
        set({ 
          hospital, 
          district: getHospitalDistrict(hospital) || null,
          program: primaryProgram, 
          programs: allPrograms, 
          facilities 
        }),
      clearSession: () => set({ hospital: null, district: null, program: null, programs: [], facilities: [] }),
    }),
    {
      name: 'riwa-user-session',
    }
  )
);
