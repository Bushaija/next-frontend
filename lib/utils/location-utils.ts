import districtsProvincesData from "@/constants/districts-provinces.json";
import facilitiesData from "@/constants/facilities-data.json";

export interface District {
  id: number;
  district: string;
}

export function getProvinces() {
  return Array.from(new Set(districtsProvincesData.map(item => item.province)))
    .sort()
    .map(province => ({
      value: province,
      label: province.charAt(0).toUpperCase() + province.slice(1)
    }));
}

export function getDistrictsByProvince(province: string) {
  return districtsProvincesData
    .filter(item => item.province === province)
    .map(item => ({
      value: item.district,
      label: item.district.charAt(0).toUpperCase() + item.district.slice(1)
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function getHospitals() {
  // Simulate API call or lazy loading
  const hospitals = facilitiesData
    .filter(facility => facility['facility-type'] === 'hospital')
    .flatMap(facility => facility.hospitals)
    .filter((hospital, index, self) => self.indexOf(hospital) === index)
    .sort()
    .map(hospital => ({
      value: hospital,
      label: hospital.trim().charAt(0).toUpperCase() + hospital.trim().slice(1)
    }));

  return hospitals;
}

// For future use with actual API
export async function fetchHospitalsByLocation(province: string, district: string) {
  // TODO: Implement actual API call
  const hospitals = await getHospitals();
  return hospitals.filter(hospital => 
    hospital.label.toLowerCase().includes(province.toLowerCase()) ||
    hospital.label.toLowerCase().includes(district.toLowerCase())
  );
} 