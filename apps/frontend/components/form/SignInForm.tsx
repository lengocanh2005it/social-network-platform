"use client";
import SocialsAuthForm from "@/components/form/SocialsAuthForm";
import PasswordToggleInput from "@/components/input/PasswordToggleInput";
import AccountSuspendedModal from "@/components/modal/AccountSuspendedModal";
import OTPVerification2FaModal from "@/components/modal/OTPVerification2FaModal";
import VerifyOTPModal from "@/components/modal/VerifyOTPModal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSignIn, useVerify2Fa, useVerifyEmail } from "@/hooks";
import { createTrustDevice } from "@/lib/api/auth";
import { useAppStore } from "@/store";
import {
  AuthMethod,
  CreateTrustDeviceDto,
  DeviceDetails,
  getFingerprint,
  SignInDto,
  Verify2FaActionEnum,
  Verify2FaType,
  VerifyEmailActionEnum,
} from "@/utils";
import { Button, Checkbox, Input } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Lock, Mail } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password can't be empty." }),
});

const SignInForm = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [fingerprint, setFingerprint] = useState<string>("");
  const { mutate: mutateSignIn, isPending, data } = useSignIn();
  const {
    setAuthMethod,
    is2FAModalOpen,
    setIs2FAModalOpen,
    isModalOTPOpen,
    setIsModalOTPOpen,
    isAccountSuspendedModalOpen,
  } = useAppStore();
  const {
    mutate: mutateVerify2Fa,
    isPending: isVerify2FaPending,
    isSuccess,
  } = useVerify2Fa();
  const { mutate: mutateVerifyEmail, isPending: isPendingVerifyEmail } =
    useVerifyEmail();
  const [verifyDeviceMethod, setVerifyDeviceMethod] = useState<
    "2fa" | "email" | null
  >(null);
  const [isShowVerifyDevice, setIsShowVerifyDevice] = useState<boolean>(false);
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetails | null>(
    null,
  );
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    const fetchDeviceDetails = async () => {
      const response = await fetch("/api/device-details");

      const data = await response.json();

      setDeviceDetails(data);
    };

    fetchDeviceDetails();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const signInDto: SignInDto = {
      ...values,
      fingerprint,
    };

    mutateSignIn(signInDto, {
      onError: (error: AxiosError) => {
        const responseData = error?.response?.data as Record<
          string,
          string | number
        >;

        if (
          responseData?.statusCode === 403 &&
          responseData?.message &&
          typeof responseData.message === "string"
        ) {
          setReason(responseData.message);
        }
      },
    });
  }

  useEffect(() => {
    if (
      data &&
      !data?.is_verified &&
      data?.verification_method &&
      data?.message
    ) {
      setIsShowVerifyDevice(true);

      setVerifyDeviceMethod(
        data.verification_method === "email" ? "email" : "2fa",
      );
    }
  }, [data, setIsShowVerifyDevice, setVerifyDeviceMethod]);

  useEffect(() => {
    const loadFingerprint = async () => {
      const fp = await getFingerprint();

      if (fp) setFingerprint(fp);
    };

    loadFingerprint();

    if (pathname.includes("sign-in")) setAuthMethod(AuthMethod.SIGN_IN);

    sessionStorage.setItem("oauth-in-progress", "true");
  }, [pathname, setAuthMethod]);

  const handleSignUp = () => router.push("/auth/sign-up");

  const hanldeForgetPassword = () => router.push("/auth/forgot-password");

  const handleSign2Fa = async (
    action: Verify2FaActionEnum,
    otp: string,
    email: string,
  ) => {
    if (!data) return;

    const verify2FaDto: Verify2FaType = {
      otp,
      action,
      token: data?.["2faToken"],
      email,
      ...(action === Verify2FaActionEnum.SIGN_IN && {
        password: form.getValues("password"),
      }),
    };

    if (action === Verify2FaActionEnum.VERIFY_DEVICE) {
      if (!deviceDetails || Object.keys(deviceDetails)?.length === 0) return;

      const createTrustDeviceDto: CreateTrustDeviceDto = {
        ...deviceDetails,
        email: form.getValues("email"),
      };

      mutateVerify2Fa(verify2FaDto, {
        onSuccess: async (data: Record<string, string | number | boolean>) => {
          if (
            data?.is_verified &&
            data?.message &&
            createTrustDeviceDto &&
            Object?.keys(createTrustDeviceDto)?.length
          ) {
            setIsShowVerifyDevice(false);

            await createTrustDevice(createTrustDeviceDto);

            const signInDto: SignInDto = {
              email: form.getValues("email"),
              password: form.getValues("password"),
              fingerprint,
            };

            mutateSignIn(signInDto);
          }
        },
      });
    } else mutateVerify2Fa(verify2FaDto);
  };

  useEffect(() => {
    if (isSuccess) {
      setIs2FAModalOpen(false);
    }
  }, [isSuccess, setIs2FAModalOpen]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="md:w-3/4 md:gap-6 gap-4 w-full flex flex-col"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="johndoe01@gmail.com"
                  startContent={<Mail className="dark:text-white" />}
                  isClearable
                  suppressHydrationWarning
                  aria-label="email"
                  aria-labelledby="email"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onClear={() => {
                    form.setValue("email", "");
                    form.trigger("email");
                  }}
                />
              </FormControl>
              <FormMessage className="text-red-600 md:text-left text-center" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Password
              </FormLabel>
              <FormControl>
                <PasswordToggleInput
                  {...field}
                  placeholder="Your password here..."
                  startContent={<Lock className="dark:text-white" />}
                />
              </FormControl>
              <FormMessage className="text-red-600 md:text-left text-center" />
            </FormItem>
          )}
        />

        <div className="flex md:flex-row flex-col gap-1 md:items-center md:justify-between select-none">
          <a
            className="hover:underline hover:text-blue-600 
          hover:cursor-pointer italic"
            onClick={hanldeForgetPassword}
          >
            Forgot your password?
          </a>

          <Checkbox radius="full" color="primary" size="sm">
            Remember me
          </Checkbox>
        </div>

        {isPending ? (
          <>
            <Button isLoading className="w-fit mx-auto" color="primary">
              Please wait...
            </Button>
          </>
        ) : (
          <>
            <Button
              type="submit"
              className="w-fit mx-auto"
              color="primary"
              suppressHydrationWarning
            >
              Sign In
            </Button>
          </>
        )}
      </form>

      <SocialsAuthForm method={AuthMethod.SIGN_IN} />

      <div className="text-sm text-center text-black/60 dark:text-white/60">
        Don&apos;t have an account?{" "}
        <a
          onClick={handleSignUp}
          className="hover:text-blue-600 text-black dark:text-white hover:underline 
          font-medium cursor-pointer dark:hover:text-blue-600"
        >
          Sign up
        </a>
      </div>

      {is2FAModalOpen && (
        <OTPVerification2FaModal
          open={is2FAModalOpen}
          onClose={() => setIs2FAModalOpen(false)}
          onVerify={handleSign2Fa}
          isLoading={isVerify2FaPending}
          action={Verify2FaActionEnum.SIGN_IN}
          actionDescription="continue your sign in process"
          email={form.getValues("email")}
        />
      )}

      {isModalOTPOpen && (
        <VerifyOTPModal
          isOpen={isModalOTPOpen}
          setIsOpen={setIsModalOTPOpen}
          isPending={isPendingVerifyEmail}
          email={form.getValues("email")}
          textHeaders="Verify Your Email"
          description="Your email has not been verified by the system. Please enter the OTP sent to your email below to verify your email address."
          action={VerifyEmailActionEnum.SIGN_IN}
          onVerify={(dto) => {
            mutateVerifyEmail(dto, {
              onSuccess: async (data) => {
                if (data && data?.is_verified && data?.message) {
                  setIsModalOTPOpen(false);

                  const signInDto: SignInDto = {
                    email: form.getValues("email"),
                    password: form.getValues("password"),
                    fingerprint,
                  };

                  mutateSignIn(signInDto);
                }
              },
            });
          }}
          onRequestOtp={() =>
            mutateSignIn({
              email: form.getValues("email"),
              password: form.getValues("password"),
              fingerprint,
            })
          }
        />
      )}

      {isShowVerifyDevice && (
        <>
          {verifyDeviceMethod === "2fa" && (
            <OTPVerification2FaModal
              open={isShowVerifyDevice}
              onClose={() => setIsShowVerifyDevice(false)}
              email={form.getValues("email")}
              onVerify={handleSign2Fa}
              isLoading={isVerify2FaPending}
              actionDescription="to verify a new device login"
              action={Verify2FaActionEnum.VERIFY_DEVICE}
            />
          )}

          {verifyDeviceMethod === "email" && (
            <VerifyOTPModal
              isOpen={isShowVerifyDevice}
              setIsOpen={setIsShowVerifyDevice}
              email={form.getValues("email")}
              action={VerifyEmailActionEnum.VERIFY_DEVICE}
              isPending={isPendingVerifyEmail}
              textHeaders="Verify New Device"
              description="You have logged into your account from a new device. We have sent a verification OTP to your email. Please check your email and enter the code below to verify the device."
              onVerify={(dto) => {
                mutateVerifyEmail(dto, {
                  onSuccess: async (data) => {
                    if (
                      !deviceDetails ||
                      Object.keys(deviceDetails)?.length === 0
                    )
                      return;

                    if (data && data?.is_verified && data?.message) {
                      setIsShowVerifyDevice(false);

                      await createTrustDevice({
                        ...deviceDetails,
                        email: form.getValues("email"),
                      });

                      const signInDto: SignInDto = {
                        email: form.getValues("email"),
                        password: form.getValues("password"),
                        fingerprint,
                      };

                      mutateSignIn(signInDto);
                    }
                  },
                });
              }}
            />
          )}
        </>
      )}

      {isAccountSuspendedModalOpen && reason?.trim() && (
        <AccountSuspendedModal reason={reason.trim()} setReason={setReason} />
      )}
    </Form>
  );
};

export default SignInForm;
