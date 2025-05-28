import { FC } from "react";

interface ReviewFieldProps {
  label: string;
  value: string;
  className?: string;
}

export const ReviewField: FC<ReviewFieldProps> = ({ 
  label, 
  value, 
  className = "" 
}) => (
  <div 
    className={`flex justify-between ${className}`}
    role="group"
    aria-labelledby={`${label.toLowerCase()}-label`}
  >
    <span 
      id={`${label.toLowerCase()}-label`}
      className="text-neutral-400"
    >
      {label}
    </span>
      <span className="text-zinc-900">{value}</span>
    </div>
); 