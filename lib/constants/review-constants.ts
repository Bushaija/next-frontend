export enum Step {
  Personal = 0,
  Location = 1,
}

export const reviewLabels = {
  personal: {
    title: "Personal Information",
    fields: {
      name: "Name",
      email: "Email",
    },
  },
  location: {
    title: "Location Information",
    fields: {
      province: "Province",
      district: "District",
      hospital: "Hospital",
    },
  },
} as const;

export const reviewTestIds = {
  personal: "review-personal-info",
  location: "review-location-info",
} as const; 