"use client"

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputField, SelectField } from "@/components/ui/form-field";
import { useOnboardingForm } from "@/hooks/use-onboarding-form";
import { formFields } from "@/lib/schemas/onboarding-schema";
import { Loader2 } from "lucide-react";
import { getProvinces } from "@/lib/utils/location-utils";

export default function OnBoardingForm() {
  const {
    formData,
    errors,
    isSubmitting,
    isLoading,
    districts,
    hospitals,
    handleInputChange,
    handleSubmit,
  } = useOnboardingForm();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
    }

    return (
        <section className="py-12">
            <div className="mx-auto max-w-4xl px-4 lg:px-0">
        <form onSubmit={handleSubmit}>
                    <Card className="mx-auto max-w-lg p-4 sm:p-12">
            <h3 className="text-xl font-semibold">
              Select Your Hospital Location
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Please provide your details and select your hospital location to get started with our healthcare management system.
            </p>

            <div className="mt-8 space-y-6">
              {formFields.map((field) => {
                const commonProps = {
                  key: field.id,
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
                    {...commonProps}
                    type={field.type}
                  />
                );
              })}

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Continue"
                )}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </section>
  );
}
