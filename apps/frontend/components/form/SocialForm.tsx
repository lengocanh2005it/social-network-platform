"use client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useOAuthCallback } from "@/hooks";
import { useAppStore } from "@/store";
import {
  AuthMethod,
  DeviceDetails,
  formatDateToString,
  genders,
  OAuthCallbackDto,
  Provider,
} from "@/utils";
import {
  Button,
  DatePicker,
  Input,
  InputOtp,
  Select,
  SelectItem,
  Tooltip,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { now, ZonedDateTime } from "@internationalized/date";
import { MapPinHouse } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface SocialFormProps {
  finger_print: string;
  deviceDetails: DeviceDetails;
}

const SocialForm: React.FC<SocialFormProps> = ({
  finger_print,
  deviceDetails,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mutate: mutateOAuthCallback } = useOAuthCallback();
  const { setAuthMethod, oAuthTokens, oAuthNames, provider } = useAppStore();

  const formSchema = useMemo(() => {
    if (!provider) {
      return z.object({
        phone_number: z.string(),
        dob: z.custom<ZonedDateTime>(
          (val) => {
            if (!val) return false;
            const today = now(val.timeZone);
            const birthDate = val;
            let age = today.year - birthDate.year;
            if (
              today.month < birthDate.month ||
              (today.month === birthDate.month && today.day < birthDate.day)
            ) {
              age--;
            }
            return age >= 18;
          },
          {
            message: "You must be 18 or older to register.",
          },
        ),
        gender: z.enum(["male", "female", "other"], {
          errorMap: () => ({
            message: "Gender must be either 'Male', 'Female' or 'Other'.",
          }),
        }),
        address: z.string().min(1, { message: `Address can't be empty.` }),
      });
    }

    return createFormSchema(provider);
  }, [provider]);

  const createFormSchema = (provider: string) =>
    z
      .object({
        gender: z.enum(["male", "female", "other"], {
          errorMap: () => ({
            message: "Gender must be either 'Male', 'Female' or 'Other'.",
          }),
        }),
        phone_number: z
          .string()
          .min(1, { message: "Phone number can't be empty." })
          .regex(/^0\d{9}$/, { message: "Please enter a valid phone number." }),
        dob: z.custom<ZonedDateTime>(
          (val) => {
            if (!val) return false;
            const today = now(val.timeZone);
            const birthDate = val;
            let age = today.year - birthDate.year;
            if (
              today.month < birthDate.month ||
              (today.month === birthDate.month && today.day < birthDate.day)
            ) {
              age--;
            }
            return age >= 18;
          },
          {
            message: "You must be 18 or older to register.",
          },
        ),
        address: z.string().min(1, { message: `Address can't be empty.` }),
        otp: z.string().optional(),
      })
      .superRefine((data, ctx) => {
        if (provider === Provider.FACEBOOK) {
          if (!data.otp || !/^\d{6}$/.test(data.otp)) {
            ctx.addIssue({
              path: ["otp"],
              code: z.ZodIssueCode.custom,
              message: "OTP must be a 6-digit number.",
            });
          }
        }
      });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: "",
      dob: undefined,
      gender: undefined,
      address: "",
      otp: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!oAuthTokens || !oAuthNames || !provider) return;

    setIsLoading(true);

    const oAuthCallbackDto: OAuthCallbackDto = {
      ...values,
      dob: formatDateToString(values.dob),
      finger_print,
      deviceDetailsDto: deviceDetails,
      ...oAuthTokens,
      ...oAuthNames,
    };

    setTimeout(() => {
      setIsLoading(false);
      mutateOAuthCallback(oAuthCallbackDto);
    }, 2500);
  }

  const handleSignIn = () => {
    sessionStorage.setItem("oauth-in-progress", "true");
    setAuthMethod(AuthMethod.SIGN_IN);
    router.push("/auth/sign-in");
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="md:w-3/4 md:gap-4 gap-2 w-full flex flex-col"
      >
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="0393873630" {...field} />
              </FormControl>
              <FormMessage className="text-red-600 md:text-left text-center" />
            </FormItem>
          )}
        />

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

        {provider === Provider.FACEBOOK && (
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">OTP Verification</FormLabel>
                <FormControl>
                  <InputOtp length={6} {...field} className="w-fit mx-auto" />
                </FormControl>
                <FormDescription className="text-center">
                  The email you provided has not been verified. We&apos;ve sent
                  an OTP to that address. Please check your email and enter the
                  code to continue with registration. Thank you!
                </FormDescription>
                <FormMessage className="text-red-600 text-center" />
              </FormItem>
            )}
          />
        )}

        {!isLoading ? (
          <Button type="submit" color="primary" className="w-fit mx-auto">
            Submit
          </Button>
        ) : (
          <Button isLoading color="primary" className="w-fit mx-auto">
            Please wait...
          </Button>
        )}
      </form>

      <div className="text-sm text-center text-black/60 select-none">
        Have an account?{" "}
        <a
          className="hover:text-blue-600 text-black hover:underline font-medium cursor-pointer"
          onClick={handleSignIn}
        >
          Sign in
        </a>
      </div>
    </Form>
  );
};

export default SocialForm;
