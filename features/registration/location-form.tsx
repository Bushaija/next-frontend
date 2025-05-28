"use client"

import { InputField, SelectField } from "@/components/ui/form-field";
import { formFields } from "@/lib/schemas/onboarding-schema";
import { getProvinces } from "@/lib/utils/location-utils";
import FormWrapper from "./form-wrapper";
import { FormItems } from "@/constants/form-items";

interface LocationFormProps {
  formData: FormItems;
  updateForm: (data: Partial<FormItems>) => void;
  errors: Partial<Record<keyof FormItems, string>>;
  goTo?: (step: number) => void;
  districts?: Array<{ value: string; label: string }>;
  hospitals?: Array<{ value: string; label: string }>;
}

export default function LocationForm({ 
  formData, 
  updateForm, 
  errors,
  districts = [],
  hospitals = []
}: LocationFormProps) {
  const handleInputChange = (field: keyof FormItems, value: string) => {
    updateForm({ [field]: value });
  };

  return (
    <FormWrapper
      title="Select Your Hospital Location"
      description="Please provide your details and select your hospital location to get started."
    >   
      <div className="space-y-6">
        {formFields.map((field) => {
          const commonProps = {
            id: field.id,
            label: field.label,
            value: formData[field.id],
            onChange: (value: string) => handleInputChange(field.id, value),
            error: errors[field.id],
            required: field.required,
            placeholder: field.placeholder,
            disabled: (field.id === "district" && !formData.province) ||
                    (field.id === "hospital" && !formData.district)
          };

          return field.type === "select" ? (
            <SelectField
              key={field.id}
              {...commonProps}
              options={
                field.id === "province"
                ? getProvinces()
                : field.id === "district"
                ? districts
                : hospitals
              }
            />
          ) : (
            <InputField
              key={field.id}
              {...commonProps}
              type={field.type}
            />
          );
        })}
      </div>
    </FormWrapper>
  );
}
