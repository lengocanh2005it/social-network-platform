"use client";
import { useVerifyEmail } from "@/hooks";
import { VerifyEmailDto } from "@/utils";
import {
  Button,
  InputOtp,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDraggable,
} from "@heroui/react";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface VerifyOTPModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  email: string;
}

const VerifyOTPModal: React.FC<VerifyOTPModalProps> = ({
  isOpen,
  setIsOpen,
  email,
}) => {
  const targetRef = React.useRef<HTMLElement>(
    null,
  ) as React.RefObject<HTMLElement>;
  const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mutate: mutateVerifyEmail } = useVerifyEmail();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = (data: { otp: string }) => {
    const verifyEmailDto: VerifyEmailDto = {
      otp: data.otp,
      email,
    };

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      mutateVerifyEmail(verifyEmailDto);
    }, 2500);
  };

  return (
    <Modal
      ref={targetRef}
      isOpen={isOpen}
      onOpenChange={() => setIsOpen(!isOpen)}
      isKeyboardDismissDisabled={false}
      isDismissable={false}
      shouldBlockScroll={false}
      size="lg"
      placement="center"
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
    >
      <ModalContent className="text-black">
        {(onClose) => (
          <>
            <ModalHeader {...moveProps} className="flex flex-col gap-1">
              Verify Email OTP
            </ModalHeader>
            <ModalBody className="flex flex-col md:gap-2 mx-auto gap-1 items-center justify-center">
              <p className="font-normal text-black/80 md:text-medium text-[14px] text-center">
                We have sent an OTP code to your email. Please check your inbox
                and enter the code in the verification field below.
              </p>

              <form
                className="flex flex-col md:gap-3 gap-2"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Controller
                  control={control}
                  name="otp"
                  render={({ field }) => (
                    <InputOtp
                      {...field}
                      errorMessage={errors.otp && errors.otp.message}
                      isInvalid={!!errors.otp}
                      length={6}
                    />
                  )}
                  rules={{
                    required: "OTP is required.",
                    minLength: {
                      value: 6,
                      message: "Please enter a valid OTP.",
                    },
                  }}
                />

                <div className="flex items-center justify-center md:gap-4 gap-3">
                  <Button color="primary" onPress={onClose}>
                    Cancel
                  </Button>

                  {isLoading ? (
                    <>
                      <Button
                        isLoading
                        className="bg-black text-white"
                        color="primary"
                      >
                        Please wait...
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        className="bg-black text-white"
                        color="primary"
                      >
                        Verify OTP
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default VerifyOTPModal;
