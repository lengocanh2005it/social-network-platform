"use client";
import PasswordToggleInput from "@/components/input/PasswordToggleInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useResetPassword } from "@/hooks";
import { ResetPasswordDto } from "@/utils";
import { Button } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z
  .object({
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
    confirmPassword: z.string().min(2, { message: `Password didn't match.` }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password didn't match.",
    path: ["confirmPassword"],
  });

interface ResetPasswordFormProps {
  authorize_code: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  authorize_code,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const { mutate: mutateResetPassword } = useResetPassword();

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const resetPasswordDto: ResetPasswordDto = {
      newPassword: values.password,
      authorizationCode: authorize_code,
    };

    setTimeout(() => {
      setIsLoading(false);
      mutateResetPassword(resetPasswordDto);
    }, 2500);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col md:gap-3 gap-2 md:w-2/3 w-full mx-auto"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">New Password</FormLabel>
              <FormControl>
                <PasswordToggleInput
                  {...field}
                  startContent={<Lock />}
                  placeholder="Your new strong password here..."
                />
              </FormControl>
              <FormMessage className="text-red-600 md:text-left text-center" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Confirm New Password</FormLabel>
              <FormControl>
                <PasswordToggleInput
                  startContent={<Lock />}
                  {...field}
                  placeholder="Re-enter your new password..."
                />
              </FormControl>
              <FormMessage className="text-red-600 md:text-left text-center" />
            </FormItem>
          )}
        />

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
    </Form>
  );
};

export default ResetPasswordForm;
