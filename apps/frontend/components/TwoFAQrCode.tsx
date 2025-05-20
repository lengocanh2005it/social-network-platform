"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useVerify2Fa } from "@/hooks";
import { useAppStore, useUserStore } from "@/store";
import { Verify2FaActionEnum, Verify2FaType } from "@/utils";
import { Button, InputOtp } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface TwoFAQrCodeProps {
  qrCodeUrl: string;
}

const formSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP length must be equal to 6 characters." }),
});

const TwoFAQrCode: React.FC<TwoFAQrCodeProps> = ({ qrCodeUrl }) => {
  const { user } = useUserStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });
  const { setIs2FAModalOpen, setIs2FAEnabled, setIsVerifiedFor2FA, setMethod } =
    useAppStore();
  const { mutate: mutateVerify2Fa } = useVerify2Fa();

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !user.email) return;

    const { otp } = values;

    const verify2FaDto: Verify2FaType = {
      otp,
      action: Verify2FaActionEnum.ENABLE_2FA,
      email: user.email,
    };

    mutateVerify2Fa(verify2FaDto);
  }

  const handleCancelClick = () => {
    setIs2FAModalOpen(false);
    setIs2FAEnabled(false);
    setIsVerifiedFor2FA(false);
    setMethod(null);
  };

  return (
    <div className="flex flex-col relative items-center md:gap-3 gap-2 p-2">
      <Image src={qrCodeUrl} alt="Qr Code Image" width={195} height={195} />

      <div className="flex flex-col gap-1 items-center justify-center text-center">
        <h1>Scan to Link Your Account</h1>

        <p className="text-gray-600 text-sm">
          Use an authenticator app to scan the QR code and enter the code to
          verify setup.
        </p>
      </div>

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

          <div className="flex items-center justify-center w-fit mx-auto md:gap-3 gap-2">
            <Button color="primary" onPress={handleCancelClick}>
              Cancel
            </Button>

            <Button color="primary" type="submit">
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TwoFAQrCode;
