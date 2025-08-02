"use client";
import { ErrorState, FilterUserType } from "@/utils";
import { Button, Input, Checkbox } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  MailIcon,
  PhoneIcon,
  SearchIcon,
  UserIcon,
  X,
} from "lucide-react";
import { useState } from "react";

type Props = {
  filters: FilterUserType;
  setFilters: (f: FilterUserType) => void;
  showAdvanced: boolean;
  toggleAdvanced: () => void;
  hasActiveFilters: boolean;
  onReset: () => void;
  onSearch: () => void;
  isLoading?: boolean;
};

export const UserFilterForm = ({
  filters,
  setFilters,
  showAdvanced,
  toggleAdvanced,
  hasActiveFilters,
  onReset,
  onSearch,
  isLoading = false,
}: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });

    if (errors[name as keyof ErrorState]) {
      if (name === "email" && value) {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (isValid) {
          setErrors((prev) => ({ ...prev, email: undefined }));
        }
      }

      if (name === "phoneNumber" && value) {
        const isValid = /^\+\d{1,3}\d{4,14}$/.test(value);
        if (isValid) {
          setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
        }
      }
    }
  };

  const [errors, setErrors] = useState<ErrorState>({});

  const handleClearField = (fieldName: keyof FilterUserType) => {
    setFilters({
      ...filters,
      [fieldName]: "",
    });

    if (fieldName === "email" || fieldName === "phoneNumber") {
      setErrors({
        ...errors,
        [fieldName]: undefined,
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ErrorState = {};
    let isValid = true;

    if (filters.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(filters.email)) {
      newErrors.email = "Please enter a valid email address.";
      isValid = false;
    }

    if (filters.phoneNumber && !/^\d{10}$/.test(filters.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSearch = () => {
    if (validateForm()) {
      onSearch();
    }
  };

  const handleReset = () => {
    setErrors({});
    onReset();
  };

  return (
    <div
      className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border 
    border-gray-100 dark:border-gray-800"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 grid grid-cols-1 gap-3">
              <Input
                placeholder="Full name"
                name="fullName"
                value={filters.fullName}
                onChange={handleChange}
                startContent={<UserIcon className="h-4 w-4 text-gray-500" />}
                isClearable
                onClear={() => handleClearField("fullName")}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                variant="flat"
                classNames={{
                  input:
                    "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                }}
              />

              <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                Full name of the user (e.g. John Doe)
              </p>
            </div>

            <Button
              onPress={handleSearch}
              startContent={<SearchIcon size={18} />}
              color="primary"
              className="h-[42px] min-w-[100px]"
              isLoading={isLoading}
            >
              Search
            </Button>
          </div>

          <button
            onClick={toggleAdvanced}
            className="flex items-center text-sm text-gray-600 dark:text-gray-500 
            hover:text-primary-500 transition-colors cursor-pointer dark:hover:text-gray-300"
          >
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4 mr-1" />
            ) : (
              <ChevronDown className="h-4 w-4 mr-1" />
            )}
            {showAdvanced ? "Hide advanced filters" : "Show advanced filters"}
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="space-y-2">
                    <Input
                      placeholder="Email address"
                      name="email"
                      value={filters.email}
                      onChange={handleChange}
                      startContent={
                        <MailIcon
                          className={`h-4 w-4 text-gray-500 ${errors.email && "dark:text-gray-300"}`}
                        />
                      }
                      isClearable
                      onClear={() => handleClearField("email")}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      variant="flat"
                      isInvalid={!!errors.email}
                      classNames={{
                        input:
                          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                        errorMessage: "text-red-500 dark:text-red-400 text-xs",
                      }}
                    />

                    <p
                      className={`text-xs pl-1 ${
                        errors.email
                          ? "text-red-500 dark:text-red-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {errors.email
                        ? errors.email
                        : "User's email address (e.g. johndoe01@gmail.com)"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Username"
                      name="username"
                      value={filters.username}
                      onChange={handleChange}
                      startContent={
                        <UserIcon className="h-4 w-4 text-gray-500" />
                      }
                      isClearable
                      onClear={() => handleClearField("username")}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      variant="flat"
                    />

                    <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                      Unique username (3-20 characters)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Phone number"
                      name="phoneNumber"
                      value={filters.phoneNumber}
                      onChange={handleChange}
                      startContent={
                        <PhoneIcon
                          className={`h-4 w-4 text-gray-500 
                            ${errors.phoneNumber && "dark:text-gray-300"}`}
                        />
                      }
                      isClearable
                      onClear={() => handleClearField("phoneNumber")}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      variant="flat"
                      isInvalid={!!errors.phoneNumber}
                      classNames={{
                        input:
                          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                        errorMessage: "text-red-500 dark:text-red-400 text-xs",
                      }}
                    />

                    <p
                      className={`text-xs pl-1 
                        ${
                          errors.phoneNumber
                            ? "text-red-500 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                    >
                      {errors.phoneNumber
                        ? errors.phoneNumber
                        : "User's phone number (e.g. 0393873630)"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {(hasActiveFilters || showAdvanced) && (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-3 pb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Active filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || key === "exactMatch") return null;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center pl-2.5 pr-1 py-1 rounded-full 
                      text-xs font-medium bg-blue-50 text-blue-700 
                      dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {key}: {value}
                      <button
                        onClick={() =>
                          handleClearField(key as keyof FilterUserType)
                        }
                        className="ml-1 inline-flex items-center justify-center w-5 h-5 
                        rounded-full text-blue-500 hover:bg-blue-100 hover:text-blue-700
                         dark:hover:bg-blue-800/50 dark:hover:text-blue-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
                {filters.exactMatch && (
                  <span
                    className="inline-flex items-center pl-2.5 pr-1 py-1 rounded-full 
                  text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 
                  dark:text-purple-300"
                  >
                    Exact match
                    <button
                      onClick={() =>
                        setFilters({ ...filters, exactMatch: false })
                      }
                      className="ml-1 inline-flex items-center justify-center w-5 h-5 
                      rounded-full text-purple-500 hover:bg-purple-100 
                      hover:text-purple-700 dark:hover:bg-purple-800/50 dark:hover:text-purple-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={handleReset}
                className="ml-auto text-sm text-red-500 hover:text-red-700 
                dark:hover:text-red-400 flex items-center cursor-pointer"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all
              </button>
            </div>
          )}

          {showAdvanced && (
            <div className="flex items-center justify-between pt-2">
              <Checkbox
                isSelected={filters.exactMatch}
                onValueChange={(isChecked) =>
                  setFilters({
                    ...filters,
                    exactMatch: isChecked,
                  })
                }
                classNames={{
                  base: "items-center",
                  wrapper: "rounded border-gray-300 dark:border-gray-600",
                  label: "text-sm text-gray-700 dark:text-gray-300",
                }}
              >
                Exact match only
              </Checkbox>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
