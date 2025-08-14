"use client";
import { Button, DatePicker, Select, SelectItem } from "@heroui/react";
import { DateValue } from "@internationalized/date";
import { ReportTypeEnum } from "@repo/db";
import { capitalize } from "lodash";
import { FilterIcon, XIcon } from "lucide-react";
import React, { useCallback } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

export type FilterFormValues = {
  type?: ReportTypeEnum;
  from?: DateValue;
  to?: DateValue;
  after?: string;
};

interface FilterReportsFormProps {
  defaultValues?: Partial<FilterFormValues>;
  onSubmit: (values: FilterFormValues) => void;
  isLoading?: boolean;
}

const typeOptions = Object.values(ReportTypeEnum).map((status) => ({
  label: capitalize(status),
  value: status,
}));

const FilterReportsForm: React.FC<FilterReportsFormProps> = ({
  defaultValues,
  onSubmit,
  isLoading,
}) => {
  const { control, handleSubmit, reset } = useForm<FilterFormValues>({
    defaultValues: {
      type: undefined,
      from: undefined,
      to: undefined,
      after: undefined,
      ...defaultValues,
    },
  });

  const watchedValues = useWatch({ control });
  const isFilterActive =
    watchedValues.type !== undefined ||
    watchedValues.from !== undefined ||
    watchedValues.to !== undefined;

  const handleReset = useCallback(() => {
    const resetValues = {
      ...defaultValues,
      type: undefined,
      from: undefined,
      to: undefined,
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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      suppressHydrationWarning
    >
      <form
        onSubmit={handleFormSubmit}
        className="flex items-center md:gap-3 gap-2"
      >
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              label="Type"
              placeholder="Select type"
              isDisabled={isLoading}
              disallowEmptySelection={true}
              suppressHydrationWarning
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as ReportTypeEnum;
                field.onChange(selected);
              }}
              classNames={{
                trigger: "bg-gray-50 dark:bg-gray-700",
                label: "font-medium text-gray-700 dark:text-gray-300",
              }}
            >
              {typeOptions.map((item) => (
                <SelectItem key={item.value}>{item.label}</SelectItem>
              ))}
            </Select>
          )}
        />

        <Controller
          name="from"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="From date"
              value={field.value ?? null}
              onChange={field.onChange}
              hideTimeZone
              isDisabled={isLoading}
              suppressHydrationWarning
              showMonthAndYearPickers
              classNames={{
                inputWrapper: "bg-gray-50 dark:bg-gray-700",
                label: "font-medium text-gray-700 dark:text-gray-300",
              }}
            />
          )}
        />

        <Controller
          name="to"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="To date"
              value={field.value ?? null}
              onChange={field.onChange}
              hideTimeZone
              isDisabled={isLoading}
              suppressHydrationWarning
              showMonthAndYearPickers
              classNames={{
                inputWrapper: "bg-gray-50 dark:bg-gray-700",
                label: "font-medium text-gray-700 dark:text-gray-300",
              }}
            />
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

export default FilterReportsForm;
