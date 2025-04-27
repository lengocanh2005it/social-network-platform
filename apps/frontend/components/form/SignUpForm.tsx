"use client";
import VerifyOTPModal from "@/components/modal/VerifyOTPModal";
import { useSignUp } from "@/hooks";
import { useAppStore } from "@/store";
import { DeviceDetails, formatDateToString, SignUpDto } from "@/utils";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { now, ZonedDateTime } from "@internationalized/date";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import CredentialsForm from "./CredentialsForm";
import DetailsForm from "./DetailsForm";

const formSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long." })
      .refine((val) => /[A-Z]/.test(val), {
        message: "Password must contain at least one uppercase letter.",
      })
      .refine((val) => /[a-z]/.test(val), {
        message: "Password must contain at least one lowercase letter.",
      })
      .refine((val) => /\d/.test(val), {
        message: "Password must contain at least one number.",
      })
      .refine((val) => /[^A-Za-z0-9]/.test(val), {
        message: "Password must contain at least one special character.",
      }),
  })
  .merge(
    z.object({
      phone_number: z
        .string()
        .min(1, { message: "Phone number can't be empty." })
        .regex(/^0\d{9}$/, { message: "Please enter a valid phone number." }),
      address: z.string().min(1, { message: `Address can't be empty.` }),
      first_name: z.string().min(1, { message: `First name can't be empty.` }),
      last_name: z.string().min(1, { message: `Last name can't be empty.` }),
      gender: z.enum(["male", "female", "other"], {
        errorMap: () => ({
          message: "Gender must be either 'Male', 'Female' or 'Other'.",
        }),
      }),
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
        }
      ),
    })
  );

export type FormSchemaType = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const [step, setStep] = useState<"credentials" | "details">("credentials");
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetails | null>(
    null
  );
  const [fingerprint, setFingerprint] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mutate: mutateSignUp } = useSignUp();
  const { isModalOTPOpen, setIsModalOTPOpen } = useAppStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      phone_number: "",
      address: "",
      first_name: "",
      last_name: "",
      gender: undefined,
      dob: undefined,
    },
    mode: "onTouched",
  });

  const handleValidCredentials = () => {
    setStep("details");
  };

  const handleBack = () => {
    setStep("credentials");
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (deviceDetails) {
      setIsLoading(true);

      const signUpDto: SignUpDto = {
        ...values,
        finger_print: fingerprint,
        deviceDetailsDto: deviceDetails,
        dob: formatDateToString(values.dob),
      };

      setTimeout(() => {
        mutateSignUp(signUpDto);
        setIsLoading(false);
      }, 2500);
    }
  };

  useEffect(() => {
    const loadFingerprint = async () => {
      const fp = await FingerprintJS.load();

      const result = await fp.get();

      setFingerprint(result.visitorId);
    };

    loadFingerprint();

    const fetchDeviceDetails = async () => {
      const response = await fetch("/api/device-details");

      const data = await response.json();

      setDeviceDetails(data);
    };

    fetchDeviceDetails();
  }, []);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="md:w-3/4 md:gap-6 gap-4 w-full flex flex-col"
      >
        {step === "credentials" && (
          <CredentialsForm onValidSubmit={handleValidCredentials} form={form} />
        )}

        {step === "details" && (
          <DetailsForm form={form} onBack={handleBack} isLoading={isLoading} />
        )}
      </form>

      {isModalOTPOpen && (
        <VerifyOTPModal
          isOpen={isModalOTPOpen}
          setIsOpen={setIsModalOTPOpen}
          email={form.getValues("email")}
        />
      )}
    </FormProvider>
  );
};

export default SignUpForm;
