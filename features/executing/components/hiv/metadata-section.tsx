"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Import the schema and types from the shared location
import { 
  metadataSchema, 
  MetadataFormValues,
  PROJECTS,
  REPORTING_PERIODS
} from "@/features/executing/schema/financial-report"

// Mock data - in a real app, this would come from an API or props
const HEALTH_CENTERS = [
  { name: "NYAMIRAMA", district: "KAYONZA" },
  { name: "RUKARA", district: "KAYONZA" },
  { name: "GAHINI", district: "KAYONZA" },
  { name: "RWAMAGANA", district: "RWAMAGANA" },
]

export type FacilityType = "healthCenter" | "hospital";

interface MetadataSectionProps {
  onMetadataChange?: (values: MetadataFormValues) => void
  onGenerateReport?: (values: MetadataFormValues) => void
  initialValues?: Partial<MetadataFormValues>
  healthCenters?: Array<{ name: string; district: string }>
  projects?: readonly string[]
  reportingPeriods?: readonly string[]
  facilityLabelType?: FacilityType
}

export function MetadataSection({
  onMetadataChange,
  onGenerateReport,
  initialValues,
  healthCenters = HEALTH_CENTERS,
  projects = PROJECTS,
  reportingPeriods = REPORTING_PERIODS,
  facilityLabelType = "healthCenter",
}: MetadataSectionProps) {
  // Initialize the form with default values or passed in values
  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      healthCenter: initialValues?.healthCenter || "",
      district: initialValues?.district || "",
      project: initialValues?.project || "",
      reportingPeriod: initialValues?.reportingPeriod || "",
    },
  })

  // Watch the health center selection to update district
  const selectedHealthCenter = form.watch("healthCenter")
  
  // Update district when health center changes
  useEffect(() => {
    if (selectedHealthCenter) {
      const center = healthCenters.find(hc => hc.name === selectedHealthCenter)
      if (center) {
        form.setValue("district", center.district)
      }
    }
  }, [selectedHealthCenter, form, healthCenters])

  // Handle form value changes
  const handleFormChange = () => {
    const values = form.getValues()
    if (onMetadataChange) {
      onMetadataChange(values)
    }
  }

  // Handle generate report button click
  const handleGenerateReport = () => {
    const values = form.getValues()
    
    // Validate that required fields are filled
    if (!values.healthCenter || !values.reportingPeriod) {
      // Trigger form validation
      form.trigger();
      return;
    }
    
    if (onGenerateReport) {
      onGenerateReport(values);
    }
  }

  const facilityLabel = facilityLabelType === "hospital" ? "Hospital" : "Health Center";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Financial Report</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onChange={handleFormChange} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Health Center or Hospital */}
              <FormField
                control={form.control}
                name="healthCenter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{facilityLabel}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select a ${facilityLabel.toLowerCase()}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {healthCenters.map((center) => (
                          <SelectItem key={center.name} value={center.name}>
                            {center.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* District (auto-filled) */}
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        placeholder="District will auto-populate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project */}
              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project} value={project}>
                            {project}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reporting Period */}
              <FormField
                control={form.control}
                name="reportingPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reporting Period</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reporting period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reportingPeriods.map((period) => (
                          <SelectItem key={period} value={period}>
                            {period}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleGenerateReport}
          size="lg"
          className="font-medium"
        >
          Generate Financial Form
        </Button>
      </CardFooter>
    </Card>
  )
}
