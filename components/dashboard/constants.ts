export type Program = {
  name: string;
  status: boolean;
};

export type ReportingPeriod = {
  value: string;
  label: string;
};

export type FacilityType = "Hospital" | "Health Center";

export const FACILITY_ICONS = {
  Hospital: {
    icon: "H",
    color: "text-yellow-500",
  },
  "Health Center": {
    icon: "HC",
    color: "text-green-500",
  },
} as const;

export const FACILITY_STATUS = {
  active: "✔️",
  inactive: "❌",
} as const;

export interface HealthFacilityProps {
  healthFacilityType: FacilityType;
  healthFacilityName: string;
  district: string;
  programs: Program[];
  reportingPeriodOptions: ReportingPeriod[];
  reportingPeriod?: string;
  onClick?: () => void;
} 