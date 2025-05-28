import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface BaseFormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface InputFieldProps extends BaseFormFieldProps {
  type: "text" | "email" | "tel" | "password";
}

export interface SelectFieldProps extends BaseFormFieldProps {
  options: Array<{ value: string; label: string }>;
}

export function InputField(props: InputFieldProps) {
  const { id, label, error, required, disabled, className, type, value, onChange, placeholder } = props;
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={cn("w-full", error && "border-red-500", disabled && "opacity-50 cursor-not-allowed")}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : descriptionId}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-500" role="alert">{error}</p>
      ) : (
        <p id={descriptionId} className="mt-1 text-sm text-gray-500 sr-only">Enter your {label.toLowerCase()}</p>
      )}
    </div>
  );
}

export function SelectField(props: SelectFieldProps) {
  const { id, label, error, required, disabled, className, value, onChange, options, placeholder } = props;
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger 
          id={id}
          className={cn("w-full", error && "border-red-500", disabled && "opacity-50 cursor-not-allowed")}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : descriptionId}
        >
          <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-500" role="alert">{error}</p>
      ) : (
        <p id={descriptionId} className="mt-1 text-sm text-gray-500 sr-only">Select your {label.toLowerCase()}</p>
      )}
    </div>
  );
} 