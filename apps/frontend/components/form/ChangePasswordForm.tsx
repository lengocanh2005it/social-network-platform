import PasswordToggleInput from "@/components/input/PasswordToggleInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useChangePassword } from "@/hooks";
import { ChangePasswordDto } from "@/utils";
import { Button, Input } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password can't be empty." }),
    newPassword: z
      .string()
      .min(6, { message: "New password must be at least 6 characters long." })
      .refine((val) => /[A-Z]/.test(val), {
        message: "New password must contain at least one uppercase letter.",
      })
      .refine((val) => /[a-z]/.test(val), {
        message: "New password must contain at least one lowercase letter.",
      })
      .refine((val) => /\d/.test(val), {
        message: "New password must contain at least one number.",
      })
      .refine((val) => /[^A-Za-z0-9]/.test(val), {
        message: "New password must contain at least one special character.",
      }),
    confirmNewPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.confirmNewPassword !== undefined &&
      data.newPassword !== data.confirmNewPassword
    ) {
      ctx.addIssue({
        path: ["confirmNewPassword"],
        code: z.ZodIssueCode.custom,
        message: "New password do not match.",
      });
    }
  });

interface ChangePasswordFormProps {
  setShowPasswordForm: Dispatch<SetStateAction<boolean>>;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  setShowPasswordForm,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: undefined,
    },
  });
  const { mutate: mutateChangePassword } = useChangePassword();

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { currentPassword, newPassword } = values;

    const changePasswordDto: ChangePasswordDto = {
      currentPassword,
      newPassword,
    };

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      mutateChangePassword(changePasswordDto);
    }, 2500);
  }

  return (
    <section
      className="shadow-sm p-4 px-8 rounded-lg w-2/3 mx-auto flex flex-col
    md:gap-3 gap-2"
    >
      <div className="flex flex-col items-center text-center justify-center">
        <h1 className="text-lg">Update Password</h1>

        <p className="text-gray-700">
          Let&apos;s keep your account safe — update your password below.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="md:w-3/4 w-full md:gap-3 mx-auto gap-2 flex flex-col"
        >
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <PasswordToggleInput
                    {...field}
                    placeholder="Your current password here..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordToggleInput
                    {...field}
                    placeholder="Your new strong password here..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Confirm your new password..."
                    {...field}
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center w-fit mx-auto md:gap-2 gap-1">
            <Button onPress={() => setShowPasswordForm(false)} color="primary">
              Cancel
            </Button>

            {isLoading ? (
              <Button isLoading color="primary">
                Please wait...
              </Button>
            ) : (
              <Button type="submit" color="primary">
                Submit
              </Button>
            )}
          </div>
        </form>
      </Form>
    </section>
  );
};

export default ChangePasswordForm;
