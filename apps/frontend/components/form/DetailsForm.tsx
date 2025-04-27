"use client";
import { FormSchemaType } from "@/components/form/SignUpForm";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

type DetailsFormProps = {
  form: UseFormReturn<FormSchemaType>;
  onBack: () => void;
  isLoading: boolean;
};

const DetailsForm = ({ form, onBack, isLoading }: DetailsFormProps) => {
  const [loading, setLoading] = useState<boolean>(false);

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
                data.display_name || "Unable to fetch address"
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
        }
      );
    } else {
      form.setValue("address", "Browser does not support Geolocation");
      form.trigger("address");
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex md:flex-row flex-col gap-3 md:items-center md:justify-between">
        <div className="md:w-1/2 w-full">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">First Name</FormLabel>
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
                <FormLabel className="text-black">Last Name</FormLabel>
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
            <FormLabel className="text-black">Gender</FormLabel>
            <FormControl>
              <Select
                className="text-black"
                placeholder="Female"
                {...field}
                defaultSelectedKeys={[form.getValues().gender]}
              >
                {genders.map((gender) => (
                  <SelectItem key={gender.key} className="text-black">
                    {gender.label}
                  </SelectItem>
                ))}
              </Select>
            </FormControl>
            <FormMessage className="text-red-600 md:text-left text-center" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dob"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black">Date of birth</FormLabel>
            <FormControl>
              <DatePicker
                hideTimeZone
                showMonthAndYearPickers
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
        name="phone_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black">Phone Number</FormLabel>
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
            <FormLabel className="text-black">Address</FormLabel>
            <FormControl>
              <Input
                placeholder={
                  loading ? "Loading..." : "123 Main Street, London, England"
                }
                endContent={
                  <Tooltip
                    content="Click to get the current address based on your location"
                    className="text-black"
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

      <div className="flex w-fit mx-auto md:gap-6 gap-4">
        <Button
          type="button"
          className="bg-black text-white"
          onPress={onBack}
          startContent={<MoveLeft />}
        >
          Back
        </Button>

        {isLoading === false ? (
          <>
            <Button type="submit" className="bg-primary text-white">
              Sign Up
            </Button>
          </>
        ) : (
          <>
            <Button isLoading className="bg-primary text-white">
              Please wait...
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

export default DetailsForm;
