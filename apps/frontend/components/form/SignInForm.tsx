"use client";
import SocialsAuthForm from "@/components/form/SocialsAuthForm";
import PasswordToggleInput from "@/components/input/PasswordToggleInput";
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
import { useAppStore } from "@/store";
import {
  AuthMethod,
  SignInDto,
  Verify2FaActionEnum,
  Verify2FaType,
  VerifyEmailActionEnum,
} from "@/utils";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Button, Checkbox, Input } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
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
  } = useAppStore();
  const {
    mutate: mutateVerify2Fa,
    isPending: isVerify2FaPending,
    isSuccess,
  } = useVerify2Fa();
  const { mutate: mutateVerifyEmail, isPending: isPendingVerifyEmail } =
    useVerifyEmail();

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

    mutateSignIn(signInDto);
  }

  useEffect(() => {
    const loadFingerprint = async () => {
      const fp = await FingerprintJS.load();

      const result = await fp.get();

      setFingerprint(result.visitorId);
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
      password: form.getValues("password"),
      token: data?.["2faToken"],
      email,
    };

    mutateVerify2Fa(verify2FaDto);
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
              <FormLabel className="text-black">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="johndoe01@gmail.com"
                  startContent={<Mail />}
                  isClearable
                  value={field.value}
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
              <FormLabel className="text-black">Password</FormLabel>
              <FormControl>
                <PasswordToggleInput
                  {...field}
                  placeholder="Your password here..."
                  startContent={<Lock />}
                />
              </FormControl>
              <FormMessage className="text-red-600 md:text-left text-center" />
            </FormItem>
          )}
        />

        <div className="flex md:flex-row flex-col gap-1 md:items-center md:justify-between select-none">
          <a
            className="hover:underline hover:text-blue-600 transition-colors duration-200 
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
            <Button type="submit" className="w-fit mx-auto" color="primary">
              Sign In
            </Button>
          </>
        )}
      </form>

      <SocialsAuthForm method={AuthMethod.SIGN_IN} />

      <div className="text-sm text-center text-black/60">
        Don&apos;t have an account?{" "}
        <a
          onClick={handleSignUp}
          className="hover:text-blue-600 text-black hover:underline font-medium cursor-pointer"
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
    </Form>
  );
};

export default SignInForm;
