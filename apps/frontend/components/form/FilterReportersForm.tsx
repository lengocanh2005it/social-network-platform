"use client";
import { reasonReportOptions } from "@/utils";
import { Button, Select, SelectItem } from "@heroui/react";
import { ReportReasonEnum } from "@repo/db";
import { FilterIcon, XIcon } from "lucide-react";
import React, { useCallback } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

export type FilterFormValues = {
  reason?: ReportReasonEnum;
  after?: string;
};

interface FilterReportsFormProps {
  defaultValues?: Partial<FilterFormValues>;
  onSubmit: (values: FilterFormValues) => void;
  isLoading?: boolean;
}

const reasonReportMap = Object.fromEntries(
  reasonReportOptions.map((item) => [item.key, item.label]),
);

const reasonOptions = Object.values(ReportReasonEnum).map((reason) => ({
  label: reasonReportMap[reason],
  value: reason,
}));

const FilterReportersForm: React.FC<FilterReportsFormProps> = ({
  defaultValues,
  onSubmit,
  isLoading,
}) => {
  const { control, handleSubmit, reset } = useForm<FilterFormValues>({
    defaultValues: {
      reason: undefined,
      after: undefined,
      ...defaultValues,
    },
  });

  const watchedValues = useWatch({ control });
  const isFilterActive = watchedValues.reason !== undefined;

  const handleReset = useCallback(() => {
    const resetValues = {
      ...defaultValues,
      reason: undefined,
      after: undefined,
    };
    reset(resetValues);
    onSubmit(resetValues);
  }, [reset, defaultValues, onSubmit]);

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit(values);
  });

  return (
    <div
      suppressHydrationWarning
      className="relative border-t dark:border-t-gray-700 pt-3"
    >
      <form
        onSubmit={handleFormSubmit}
        className="flex items-center md:gap-3 gap-2"
      >
        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <Select
              label="Reason"
              placeholder="Select reason"
              suppressHydrationWarning
              isDisabled={isLoading}
              disallowEmptySelection={true}
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as
                  | ReportReasonEnum
                  | undefined;
                field.onChange(selected ?? undefined);
              }}
            >
              {reasonOptions.map((item) => (
                <SelectItem key={item.value}>{item.label}</SelectItem>
              ))}
            </Select>
          )}
        />

        <div className="flex items-center md:gap-2 gap-1">
          <Button
            suppressHydrationWarning
            type="button"
            onPress={handleReset}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 
                bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                px-4 py-2 rounded-md text-gray-800 dark:text-gray-200 text-sm font-medium 
                transition-colors border border-gray-200 dark:border-gray-600 cursor-pointer"
            isDisabled={isLoading || !isFilterActive}
          >
            <XIcon className="h-4 w-4" />
            Reset
          </Button>

          <Button
            type="submit"
            suppressHydrationWarning
            className="flex-1 md:flex-none flex items-center justify-center gap-2 
                bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white text-sm 
                font-medium transition-colors cursor-pointer"
            isDisabled={isLoading || !isFilterActive}
          >
            <FilterIcon className="h-4 w-4" />
            {isLoading ? "Applying..." : "Apply"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FilterReportersForm;
