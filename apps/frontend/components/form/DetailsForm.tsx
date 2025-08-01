"use client";
import { FormSchemaType } from "@/components/form/SignUpForm";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store";
import { genders } from "@/utils";
import {
  Button,
  DatePicker,
  Input,
  Select,
  SelectItem,
  Tooltip,
} from "@heroui/react";
import { MapPinHouse, MoveLeft } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import Turnstile from "react-turnstile";

type DetailsFormProps = {
  form: UseFormReturn<FormSchemaType>;
  onBack: () => void;
  isLoading: boolean;
};

const DetailsForm = ({ form, onBack, isLoading }: DetailsFormProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { setCloudfareToken } = useAppStore();

  const onVerify = (token: string) => {
    setCloudfareToken(token);
  };

  const getLocation = () => {
    setLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
          fetch(url)
            .then((response) => response.json())
            .then((data) => {
              form.setValue(
                "address",
                data.display_name || "Unable to fetch address",
              );
              form.trigger("address");
              setLoading(false);
            })
            .catch(() => {
              form.setValue("address", "Unable to fetch address");
              form.trigger("address");
              setLoading(false);
            });
        },
        () => {
          form.setValue("address", "Unable to get location");
          form.trigger("address");
          setLoading(false);
        },
      );
    } else {
      form.setValue("address", "Browser does not support Geolocation");
      form.trigger("address");
      setLoading(false);
    }
  };

  return (
    <ScrollArea className="h-[500px]">
      <section className="flex flex-col gap-3">
        <div className="flex md:flex-row flex-col gap-3 md:items-center md:justify-between">
          <div className="md:w-1/2 w-full">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black dark:text-white">
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-600 md:text-left text-center" />
                </FormItem>
              )}
            />
          </div>

          <div className="md:w-1/2 w-full">
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black dark:text-white">
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-600 md:text-left text-center" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Gender
              </FormLabel>
              <FormControl>
                <Select
                  className="text-black"
                  placeholder="Female"
                  {...field}
                  defaultSelectedKeys={[form.getValues().gender]}
                >
                  {genders.map((gender) => (
                    <SelectItem
                      key={gender.key}
                      className="text-black dark:text-white"
                    >
                      {gender.label}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
              <FormMessage className="text-red-600 md:text-left text-center" />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 grid-cols-1 md:gap-3 gap-2">
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  Date of birth
                </FormLabel>
                <FormControl>
                  <DatePicker
                    hideTimeZone
                    showMonthAndYearPickers
                    className="dark:text-white text-black"
                    aria-labelledby="date-and-time"
                    aria-label="date-and-time"
                    {...field}
                    inert={false}
                  />
                </FormControl>
                <FormMessage className="text-red-600 md:text-left text-center" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <Tooltip content="This will be used in your public profile URL (e.g. /profile/your_username)">
                  <FormLabel className="text-black dark:text-white">
                    Username
                  </FormLabel>
                </Tooltip>
                <FormControl>
                  <Input placeholder="john_doe01" {...field} />
                </FormControl>
                <FormMessage className="text-red-600 md:text-left text-center" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Phone Number
              </FormLabel>
              <FormControl>
                <Input placeholder="+84393873630" {...field} />
              </FormControl>
              <FormMessage className="text-red-600 md:text-left text-center" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Address
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    loading ? "Loading..." : "123 Main Street, London, England"
                  }
                  endContent={
                    <Tooltip
                      content="Click to get the current address based on your location"
                      className="text-black dark:text-white"
                    >
                      <MapPinHouse
                        className="cursor-pointer opacity-60 hover:opacity-100 
                    transition-opacity duration-300 select-none"
                        onClick={getLocation}
                      />
                    </Tooltip>
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-600 md:text-left text-center" />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-center">
          <Turnstile
            sitekey={process.env.NEXT_PUBLIC_CLOUDFARE_SITE_KEY || ""}
            onVerify={onVerify}
          />
        </div>

        <div className="flex w-fit mx-auto md:gap-4 gap-2">
          <Button
            type="button"
            className="bg-black text-white dark:bg-white dark:text-black"
            onPress={onBack}
            startContent={<MoveLeft />}
          >
            Back
          </Button>

          {isLoading === false ? (
            <>
              <Button
                type="submit"
                color="primary"
                className="text-white dark:bg-white dark:text-black"
              >
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Button
                isLoading
                color="primary"
                className="text-white dark:bg-white dark:text-black"
              >
                Please wait...
              </Button>
            </>
          )}
        </div>
      </section>
    </ScrollArea>
  );
};

export default DetailsForm;
