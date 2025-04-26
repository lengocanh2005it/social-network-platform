"use client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForgotPassword } from "@/hooks";
import { ForgotPasswordDto } from "@/utils";
import { Button, Input } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter the valid email." }),
});

const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });
  const { mutate: mutateForgotPassword } = useForgotPassword();

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const forgotPasswordDto: ForgotPasswordDto = values;

    setTimeout(() => {
      setIsLoading(false);
      mutateForgotPassword(forgotPasswordDto);
    }, 2500);
  }

  const handleSignIn = () => router.push("/auth/sign-in");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col md:gap-3 gap-2 md:w-2/3 w-full mx-auto"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Email</FormLabel>
              <FormControl>
                <Input
                  startContent={<Mail />}
                  placeholder="johndoe01@gmail.com"
                  isClearable
                  value={field.value}
                  onChange={field.onChange}
                  onClear={() => {
                    form.setValue("email", "");
                    form.trigger("email");
                  }}
                />
              </FormControl>
              <FormDescription className="md:text-left text-center">
                Please enter the email address associated with your account.
              </FormDescription>
              <FormMessage className="text-red-600 md:text-left text-center" />
            </FormItem>
          )}
        />

        {isLoading ? (
          <>
            <Button isLoading color="primary" className="w-fit mx-auto">
              Please wait...
            </Button>
          </>
        ) : (
          <>
            <Button type="submit" color="primary" className="w-fit mx-auto">
              Send
            </Button>
          </>
        )}
      </form>

      <div className="text-sm text-center text-black/60">
        Have an account?{" "}
        <a
          className="hover:text-blue-600 text-black hover:underline font-medium cursor-pointer"
          onClick={handleSignIn}
        >
          Sign in
        </a>
      </div>
    </Form>
  );
};

export default ForgotPasswordForm;
