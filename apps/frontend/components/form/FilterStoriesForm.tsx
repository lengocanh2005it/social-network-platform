"use client";
import { Button, DatePicker, Input, Select, SelectItem } from "@heroui/react";
import { DateValue } from "@internationalized/date";
import { StoryStatusEnum } from "@repo/db";
import { FilterIcon, SearchIcon, XIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

export type FilterFormValues = {
  search: string;
  status?: StoryStatusEnum;
  from?: DateValue;
  to?: DateValue;
  email?: string;
  username?: string;
};

interface FilterStoriesFormProps {
  defaultValues?: Partial<FilterFormValues>;
  onChange: (values: {
    search: string;
    status?: StoryStatusEnum;
    from?: DateValue;
    to?: DateValue;
    email?: string;
    username?: string;
  }) => void;
  isLoading?: boolean;
  isClearTrigger?: boolean;
}

const statusOptions = Object.values(StoryStatusEnum).map((status) => ({
  label: status,
  value: status,
}));

const FilterStoriesForm: React.FC<FilterStoriesFormProps> = ({
  defaultValues,
  onChange,
  isLoading,
  isClearTrigger,
}) => {
  const { control, handleSubmit, watch, getValues, reset } =
    useForm<FilterFormValues>({
      defaultValues: {
        search: "",
        status: undefined,
        from: undefined,
        to: undefined,
        ...defaultValues,
      },
    });

  const watchedValues = useWatch({ control });
  const search = watch("search");

  const isFilterActive =
    watchedValues.search?.trim() ||
    watchedValues.status !== undefined ||
    watchedValues.from !== undefined ||
    watchedValues.to !== undefined;

  useEffect(() => {
    const timeout = setTimeout(() => {
      const values = getValues();
      const trimmed = search.trim();
      const isEmail = trimmed.includes("@");

      onChange({
        search: trimmed,
        status: values.status,
        from: values.from,
        to: values.to,
        ...(trimmed
          ? isEmail
            ? { email: trimmed }
            : { username: trimmed }
          : {}),
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, getValues, onChange]);

  const handleReset = useCallback(() => {
    reset({
      search: "",
      status: undefined,
      from: undefined,
      to: undefined,
      ...defaultValues,
    });

    onChange({
      search: "",
      status: undefined,
      from: undefined,
      to: undefined,
      ...(defaultValues?.search?.includes("@")
        ? { email: defaultValues.search }
        : { username: defaultValues?.search }),
    });
  }, [reset, onChange, defaultValues]);

  useEffect(() => {
    if (isClearTrigger === true) {
      handleReset();
    }
  }, [isClearTrigger, handleReset]);

  const onSubmit = handleSubmit((values) => {
    const trimmed = values.search?.trim();
    const isEmail = trimmed?.includes("@");

    onChange({
      search: trimmed ?? "",
      status: values.status,
      from: values.from,
      to: values.to,
      ...(trimmed
        ? isEmail
          ? { email: trimmed }
          : { username: trimmed }
        : {}),
    });
  });

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      suppressHydrationWarning
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Controller
              name="search"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Search by author's email or username"
                  startContent={
                    <SearchIcon className="h-4 w-4 text-gray-400" />
                  }
                  suppressHydrationWarning
                  suppressContentEditableWarning
                  isClearable
                  onClear={() => field.onChange("")}
                  classNames={{
                    inputWrapper: "bg-gray-50 dark:bg-gray-700",
                  }}
                />
              )}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Button
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
              className="flex-1 md:flex-none flex items-center justify-center gap-2 
                bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white text-sm 
                font-medium transition-colors cursor-pointer"
              isDisabled={isLoading || !isFilterActive}
            >
              <FilterIcon className="h-4 w-4" />
              {isLoading ? "Applying..." : "Apply"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label="Status"
                placeholder="Select status"
                suppressHydrationWarning
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as StoryStatusEnum;
                  field.onChange(selected);
                }}
                classNames={{
                  trigger: "bg-gray-50 dark:bg-gray-700",
                  label: "font-medium text-gray-700 dark:text-gray-300",
                }}
              >
                {statusOptions.map((item) => (
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
                suppressHydrationWarning
                showMonthAndYearPickers
                classNames={{
                  inputWrapper: "bg-gray-50 dark:bg-gray-700",
                  label: "font-medium text-gray-700 dark:text-gray-300",
                }}
              />
            )}
          />
        </div>
      </form>
    </div>
  );
};

export default FilterStoriesForm;
