import { FC, ReactNode } from "react";

interface ReviewSectionProps {
  title: string;
  children: ReactNode;
  onEdit?: () => void;
  className?: string;
  "data-testid"?: string;
}

export const ReviewSection: FC<ReviewSectionProps> = ({
  title,
  children,
  onEdit,
  className = "",
  "data-testid": testId
}) => (
  <div 
    className={`bg-[#FAFAFA] text-zinc-900 p-4 rounded-md ${className}`}
    role="region"
    aria-labelledby={`${title.toLowerCase().replace(/\s+/g, "-")}-title`}
    data-testid={testId}
  >
    <h3 
      id={`${title.toLowerCase().replace(/\s+/g, "-")}-title`}
      className="font-semibold text-zinc-900"
    >
      {title}
    </h3>
    <div className="text-sm flex flex-col">
      {children}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="bg-[#6fe79f] p-[3px] rounded-sm w-[60px] mt-2 text-white font-semibold text-sm hover:underline"
          data-testid={`${testId}-edit-button`}
        >
          Edit
        </button>
      )}
    </div>
  </div>
); 