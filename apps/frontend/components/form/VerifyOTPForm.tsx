"use client";
import RequestOtpButton from "@/components/button/RequestOtpButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import VerifyOTPHeader from "@/components/VerifyOTPHeader";
import { sendOtp } from "@/lib/api/auth";
import { useAppStore, useUserStore } from "@/store";
import { SendOtpType } from "@/utils";
import { InputOtp } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

const formSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP length must be equal to 6 characters." }),
});

const VerifyOTPForm: React.FC = () => {
  const { method, setAccountOwnershipOtp } = useAppStore();
  const { user } = useUserStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  const otp = form.watch("otp");

  useEffect(() => {
    if (otp.length === 6) setAccountOwnershipOtp(otp);
    else setAccountOwnershipOtp("");
  }, [otp, setAccountOwnershipOtp]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { otp } = values;

    setAccountOwnershipOtp(otp);
  }

  const handleRequestNewOtpClick = async () => {
    const sendOtpDto: SendOtpType = {
      method: "sms",
      type: "verify",
      ...(method === "phone_number"
        ? { phone_number: user?.profile?.phone_number as string }
        : { email: user?.email as string }),
    };

    const response = await sendOtp(sendOtpDto);

    if (response && response?.success === true) {
      toast.success(
        `We have sent a verification code to your ${
          method === "phone_number" ? "phone number" : "email"
        }. Please check your messages.`,
      );
    }
  };

  return (
    <section className="flex flex-col items-center justify-center md:gap-3 gap-2">
      <VerifyOTPHeader />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col md:gap-2 gap-1 w-full items-center justify-center"
        >
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl className="flex flex-col items-center justify-center w-full">
                  <InputOtp {...field} length={6} />
                </FormControl>
                <FormMessage className="text-red-600 md:text-left text-center" />
              </FormItem>
            )}
          />

          <RequestOtpButton onRequest={handleRequestNewOtpClick} />
        </form>
      </Form>
    </section>
  );
};

export default VerifyOTPForm;
