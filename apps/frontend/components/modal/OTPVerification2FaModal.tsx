"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { verify2Fa } from "@/lib/api/auth";
import { handleAxiosError, Verify2FaActionEnum, Verify2FaType } from "@/utils";
import {
  Button,
  InputOtp,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP length must be equal to 6 characters." }),
});

interface OtpVerification2FaModalProps {
  open: boolean;
  onClose: () => void;
  onVerifySuccess?: () => void;
  actionDescription?: string;
}

const OTPVerification2FaModal: React.FC<OtpVerification2FaModalProps> = ({
  open,
  onClose,
  onVerifySuccess,
  actionDescription,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { otp } = values;

    handleVerify(otp);
  }

  const handleVerify = async (otp: string) => {
    setIsVerifying(true);

    try {
      const verify2FaDto: Verify2FaType = {
        otp,
        action: Verify2FaActionEnum.DISABLE,
      };

      await verify2Fa(verify2FaDto);

      if (onVerifySuccess) onVerifySuccess();

      onClose();
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal
      backdrop="opaque"
      isOpen={open}
      placement="center"
      isDismissable={false}
      isKeyboardDismissDisabled={false}
      shouldBlockScroll={false}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
      onOpenChange={onClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              Verify Action
            </ModalHeader>
            <ModalBody className="text-center">
              <p>
                Enter the OTP from your authenticator app to{" "}
                {actionDescription ?? "continue"}.
              </p>

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
                    <Button color="primary" onPress={onClose}>
                      Cancel
                    </Button>

                    <Button
                      isLoading={isVerifying}
                      isDisabled={isVerifying}
                      color="primary"
                      type="submit"
                    >
                      {!isVerifying ? "Submit" : "Please wait"}
                    </Button>
                  </div>
                </form>
              </Form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default OTPVerification2FaModal;
