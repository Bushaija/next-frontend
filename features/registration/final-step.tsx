"use client";

import { ReviewField } from "@/components/ui/review-field";
import { ReviewSection } from "@/components/ui/review-section";
import { FormItems } from "@/constants/form-items";
import { Step, reviewLabels, reviewTestIds } from "@/lib/constants/review-constants";

interface FinalStepProps {
  formData: FormItems;
  updateForm: (data: Partial<FormItems>) => void;
  errors: Partial<Record<keyof FormItems, string>>;
  goTo?: (step: number) => void;
}

const FinalStep = ({ formData, goTo }: FinalStepProps) => {
  const { name, email, province, district, hospital } = formData;

  const personalInfo = [
    { label: reviewLabels.personal.fields.name, value: name },
    { label: reviewLabels.personal.fields.email, value: email },
  ];

  const locationInfo = [
    { label: reviewLabels.location.fields.province, value: province },
    { label: reviewLabels.location.fields.district, value: district },
    { label: reviewLabels.location.fields.hospital, value: hospital },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-neutral-900 md:text-2xl">
          Review Your Information
        </h2>
        <p className="text-sm text-neutral-500 md:text-base">
          Please review your details before confirming.
        </p>
      </div>

      <ReviewSection 
        title={reviewLabels.personal.title}
        onEdit={() => goTo?.(Step.Personal)}
        data-testid={reviewTestIds.personal}
      >
        {personalInfo.map(({ label, value }) => (
          <ReviewField 
            key={label} 
            label={label} 
            value={value} 
          />
        ))}
      </ReviewSection>

      <ReviewSection 
        title={reviewLabels.location.title}
        onEdit={() => goTo?.(Step.Location)}
        data-testid={reviewTestIds.location}
      >
        {locationInfo.map(({ label, value }) => (
          <ReviewField 
            key={label} 
            label={label} 
            value={value} 
          />
        ))}
      </ReviewSection>
    </div>
  );
};

export default FinalStep;