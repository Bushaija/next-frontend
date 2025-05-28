import { FacilityType, FACILITY_ICONS } from "./constants";

interface FacilityHeaderProps {
  type: FacilityType;
  name: string;
  district: string;
  onClick?: () => void;
  reportingPeriod?: string;
}

export const FacilityHeader = ({
  type,
  name,
  district,
  onClick,
  reportingPeriod,
}: FacilityHeaderProps) => {
  const facilityIcon = FACILITY_ICONS[type];

  return (
    <div
      className="flex flex-row gap-2 p-4 cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${name} ${type} in ${district}`}
      title={reportingPeriod ? `Current reporting period: ${reportingPeriod}` : undefined}
    >
      <div 
        className={`bg-black rounded-md flex justify-center items-center w-[40px] h-[40px] text-md font-bold ${facilityIcon.color}`}
        aria-hidden="true"
      >
        {facilityIcon.icon}
      </div>
      <div className="flex flex-col">
        <h4 className="text-sm font-semibold" aria-label="Facility name and type">
          {name} {type}
        </h4>
        <span className="text-sm text-muted-foreground" aria-label="Facility location">
          {name}, {district}
        </span>
      </div>
    </div>
  );
}; 