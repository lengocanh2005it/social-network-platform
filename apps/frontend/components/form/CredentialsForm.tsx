import { FormSchemaType } from "@/components/form/SignUpForm";
import SocialsAuthForm from "@/components/form/SocialsAuthForm";
import PasswordToggleInput from "@/components/input/PasswordToggleInput";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthMethod } from "@/utils";
import { Button, Input } from "@heroui/react";
import { MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

const credentialsSchema = z.object({
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
});

type CredentialsFormProps = {
  onValidSubmit: () => void;
  form: UseFormReturn<FormSchemaType>;
};

const CredentialsForm = ({ onValidSubmit, form }: CredentialsFormProps) => {
  const router = useRouter();
  const handleContinue = () => {
    form.trigger("email");
    form.trigger("password");
    const values = {
      email: form.getValues("email"),
      password: form.getValues("password"),
    };

    const result = credentialsSchema.safeParse(values);

    if (result.success) {
      onValidSubmit();
    } else {
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as "email" | "password";

        form.setError(fieldName, { message: issue.message });
      });
    }
  };

  const handleSignIn = () => router.push("/auth/sign-in");

  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black dark:text-white">Email</FormLabel>
            <FormControl>
              <Input
                placeholder="johndoe01@gmail.com"
                suppressHydrationWarning
                isClearable
                value={field?.value || ""}
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
                placeholder="Your strong password here..."
              />
            </FormControl>
            <FormMessage className="text-red-600 md:text-left text-center" />
          </FormItem>
        )}
      />

      <Button
        type="button"
        onPress={handleContinue}
        className="w-fit mx-auto bg-primary text-white dark:bg-white dark:text-black"
        endContent={<MoveRight />}
      >
        Continue
      </Button>

      <SocialsAuthForm method={AuthMethod.SIGN_UP} />

      <div className="text-sm text-center text-black/60 dark:text-white/60 select-none">
        Have an account?{" "}
        <a
          className="hover:text-blue-600 text-black dark:text-white 
          hover:underline font-medium cursor-pointer"
          onClick={handleSignIn}
        >
          Sign in
        </a>
      </div>
    </>
  );
};

export default CredentialsForm;
