import { FC } from "react";
import FormWrapper from "./form-wrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormItems } from "@/constants/form-items";

// Types
export interface FormField {
  id: keyof Pick<FormItems, "name" | "email" | "password" | "confirmPassword">;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  required?: boolean;
  autoFocus?: boolean;
  validation?: {
    pattern?: RegExp;
    message?: string;
    validate?: (value: string, formData: Partial<FormItems>) => string | undefined;
  };
}

export interface UserInfoFormProps {
  formData?: Partial<Pick<FormItems, "name" | "email" | "password" | "confirmPassword">>;
  errors?: Partial<Pick<FormItems, "name" | "email" | "password" | "confirmPassword">>;
  updateForm: (fieldToUpdate: Partial<FormItems>) => void;
  className?: string;
}

interface FormFieldProps {
  field: FormField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  className?: string;
}

// Configuration
const formFields: FormField[] = [
  {
    id: "name",
    label: "Name",
    type: "text",
    placeholder: "e.g. Stephen King",
    required: true,
    autoFocus: true,
    validation: {
      pattern: /^[a-zA-Z\s]{2,50}$/,
      message: "Name should be 2-50 characters long and contain only letters",
    },
  },
  {
    id: "email",
    label: "Email Address",
    type: "email",
    placeholder: "e.g. stephenking@lorem.com",
    required: true,
    validation: {
      pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Please enter a valid email address",
    },
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    required: true,
  },
  {
    id: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    placeholder: "Confirm your password",
    required: true,
    validation: {
      validate: (value, formData) => {
        if (value !== formData.password) {
          return "Passwords do not match";
        }
        return undefined;
      },
      message: "Passwords must match",
    },
  }
];

// Default form data
const defaultFormData: Pick<FormItems, "name" | "email" | "password" | "confirmPassword"> = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

// FormField Component
const FormFieldComponent: FC<FormFieldProps & { formData: Partial<FormItems> }> = ({
  field,
  value,
  error,
  onChange,
  className = "",
  formData,
}) => {
  const { id, label, type, placeholder, required, autoFocus, validation } = field;

  const handleChange = (newValue: string) => {
    onChange(newValue);
    // Validate on change for confirmPassword
    if (id === "confirmPassword" && validation?.validate) {
      const error = validation.validate(newValue, formData);
      if (error) {
        // You might want to handle this differently, e.g., through a callback
        console.warn(error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label 
        htmlFor={id}
        className="text-sm font-medium text-neutral-900"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        type={type}
        id={id}
        name={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        className={`w-full md:w-[70%] ${error ? "border-red-500" : ""} ${className}`}
        required={required}
        autoFocus={autoFocus}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...(validation?.pattern && {
          pattern: validation.pattern.source,
          title: validation.message,
        })}
      />
      {error && (
        <p 
          id={`${id}-error`}
          className="text-red-500 text-sm mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

// Main UserInfoForm Component
const UserInfoForm: FC<UserInfoFormProps> = ({
  formData = defaultFormData,
  errors = {},
  updateForm,
  className = "",
}) => {
  const handleFieldChange = (fieldId: keyof Pick<FormItems, "name" | "email" | "password" | "confirmPassword">, value: string) => {
    updateForm({ [fieldId]: value });
  };

  // Ensure formData has all required fields with default values
  const safeFormData = {
    ...defaultFormData,
    ...formData,
  };

  return (
    <FormWrapper
      title="Personal info"
      description="Please provide your name, email address, and password."
    >
      <div className={`w-full flex flex-col gap-5 ${className}`}>
        {formFields.map((field) => (
          <FormFieldComponent
            key={field.id}
            field={field}
            value={safeFormData[field.id] || ""}
            error={errors[field.id]}
            onChange={(value) => handleFieldChange(field.id, value)}
            formData={safeFormData}
          />
        ))}
      </div>
    </FormWrapper>
  );
};

export default UserInfoForm;