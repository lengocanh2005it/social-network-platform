"use client";
import RequestOtpButton from "@/components/button/RequestOtpButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useSendOtp, useVerifyAccountOwnership } from "@/hooks";
import { useAppStore, useUserStore } from "@/store";
import {
  SendOtpType,
  TempUserUpdateType,
  VerifyOwnershipOtpType,
} from "@/utils";
import { Button, InputOtp } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP length must be equal to 6 characters." }),
});

interface VerifyPhoneNumberOTPFormProps {
  tempUserUpdateDto: TempUserUpdateType;
}

const VerifyPhoneNumberOTPForm: React.FC<VerifyPhoneNumberOTPFormProps> = ({
  tempUserUpdateDto,
}) => {
  const { user } = useUserStore();
  const { setIsDifferentPhoneNumber } = useAppStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });
  const { mutate: mutateVerifyAccountOwnership } =
    useVerifyAccountOwnership(tempUserUpdateDto);
  const { mutate: mutateSendOtp } = useSendOtp();

  const otp = form.watch("otp");

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { otp } = values;
    const { phone_number } = tempUserUpdateDto;

    if (!user || !user?.profile) return;

    const verifyOwnershipOtp: VerifyOwnershipOtpType = {
      otp,
      method: "sms",
      phone_number,
    };

    mutateVerifyAccountOwnership(verifyOwnershipOtp);
  }

  const handleCancelClick = () => setIsDifferentPhoneNumber(false);

  const handleRequestNewOtpClick = () => {
    const sendOtpDto: SendOtpType = {
      method: "sms",
      phone_number: tempUserUpdateDto.phone_number,
      type: "update",
    };

    mutateSendOtp(sendOtpDto);
  };

  return (
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

        <div className="flex items-center md:gap-3 gap-2">
          <Button color="primary" onPress={handleCancelClick}>
            Cancel
          </Button>

          {otp.length === 6 && (
            <Button type="submit" color="primary">
              Submit
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default VerifyPhoneNumberOTPForm;
