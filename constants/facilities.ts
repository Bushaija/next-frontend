export const facilityProgramMap = {
  HIV: {
    "KIGEME Hospital": ["Cyanika", "KITABI", "Ngara", "Kibilizi", "Nyarusiza", "Uwinkingi"],
    "BUTARO HOSPITAL": ["BUTARO", "Kivuye", "RUSASA", "Rugarama", "Butaro", "Burera"],
    "MURUNDA HOSPITAL": ["Criza", "Gatumba", "Gihango", "Kibingo", "Musasa", "Nyabirasi"],
  },
  MALARIA: {
    "KIGEME Hospital": ["Cyanika", "KITABI", "Kibilizi", "Nyarusiza"],
    "BUTARO HOSPITAL": ["BUTARO", "Kivuye", "RUSASA", "Rugarama"],
    "MURUNDA HOSPITAL": ["Criza", "Gatumba", "Gihango", "Kibingo"],
  },
  TB: {
    "KIGEME Hospital": [],
    "BUTARO HOSPITAL": [],
    "MURUNDA HOSPITAL": [],
    // TB is only managed at hospital level, no centers
  }
} as const;

export const hospitalDistrictMap = {
  "KIGEME Hospital": "Nyamagabe",
  "BUTARO HOSPITAL": "Burera",
  "MURUNDA HOSPITAL": "Rutsiro",
} as const;

export type ProgramType = keyof typeof facilityProgramMap;
export type HospitalType = keyof typeof facilityProgramMap[ProgramType];
export type DistrictType = typeof hospitalDistrictMap[keyof typeof hospitalDistrictMap];

export const getAllHospitals = () => {
  return Object.keys(facilityProgramMap.HIV);
};

export const getHospitalsByProgram = (program: ProgramType) => {
  return Object.keys(facilityProgramMap[program] || {});
};

export const getFacilitiesByHospitalAndProgram = (hospital: string, program: ProgramType) => {
  return facilityProgramMap[program]?.[hospital as HospitalType] || [];
};

export const getHospitalDistrict = (hospital: string): string | undefined => {
  return hospitalDistrictMap[hospital as keyof typeof hospitalDistrictMap];
};
