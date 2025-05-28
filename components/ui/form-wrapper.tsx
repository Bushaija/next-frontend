import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormWrapperProps {
  children: React.ReactNode;
  isSubmitting: boolean;
  onSubmit: (formData: FormData) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  buttonLabel: string;
  className?: string;
  buttonClassName?: string;
}

export function FormWrapper({
  children,
  onSubmit,
  isSubmitting,
  onBack,
  canGoBack,
  buttonLabel,
  className,
  buttonClassName
}: FormWrapperProps) {
  return (
    <form 
      // onSubmit={onSubmit} 
      action={onSubmit}
      className={cn("flex flex-col justify-between h-full", className)}
    >
      {children}
      <div className="flex justify-between mt-4">
        {canGoBack && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Go Back
          </Button>
        )}
        <Button
          type="submit"
          className={cn(
            "ml-auto",
            buttonClassName,
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
        >
          {buttonLabel}
        </Button>
      </div>
    </form>
  );
} 