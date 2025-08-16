"use client";
import VerifyPhoneNumberOTPForm from "@/components/form/VerifyPhoneNumberOTPForm";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSendOtp, useUpdateProfile } from "@/hooks";
import { useAppStore, useUserStore } from "@/store";
import {
  formatDateToString,
  formatPhoneNumber,
  genders,
  SendOtpType,
  TempUserUpdateType,
  toZonedDate,
  UpdateUserProfile,
} from "@/utils";
import { Button, DatePicker, Input, Select, SelectItem } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { now, ZonedDateTime } from "@internationalized/date";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  phone_number: z
    .string()
    .min(1, { message: "Phone number can't be empty." })
    .regex(/^0\d{9}$/, { message: "Please enter a valid phone number." }),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({
      message: "Gender must be either 'Male', 'Female' or 'Other'.",
    }),
  }),
  address: z.string().min(1, { message: `Address can't be empty.` }),
  dob: z.custom<ZonedDateTime>(
    (val) => {
      if (!val) return false;

      const today = now(val.timeZone);

      const birthDate = val;

      let age = today.year - birthDate.year;

      if (
        today.month < birthDate.month ||
        (today.month === birthDate.month && today.day < birthDate.day)
      ) {
        age--;
      }

      return age >= 18;
    },
    {
      message: "You must be 18 or older to register.",
    },
  ),
  first_name: z.string().min(1, { message: `First name can't be empty.` }),
  last_name: z.string().min(1, { message: `Last name can't be empty.` }),
  nickname: z.string().optional(),
  username: z
    .string()
    .min(1, { message: `Username can't be empty.` })
    .max(100, {
      message: `Username can't be longer than 100 characters.`,
    }),
});

interface EditDetailsInformationFormProps {
  onCancel?: () => void;
}

const EditDetailsInformationForm: React.FC<EditDetailsInformationFormProps> = ({
  onCancel,
}) => {
  const { user, resetUserEducations } = useUserStore();
  const {
    setIsModalEditProfileOpen,
    isDifferentPhoneNumber,
    setIsDifferentPhoneNumber,
  } = useAppStore();
  const { mutate: mutateUpdateProfile } = useUpdateProfile();
  const { mutate: mutateSendOtp } = useSendOtp();
  const [tempUserUpdate, setTempUserUpdate] =
    useState<TempUserUpdateType | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: user?.profile?.phone_number
        ? user.profile.phone_number
        : "",
      gender: user?.profile?.gender ? user.profile.gender : undefined,
      address: user?.profile?.address ? user.profile.address : undefined,
      dob: user?.profile?.dob ? toZonedDate(user?.profile.dob) : undefined,
      first_name: user?.profile?.first_name ? user.profile.first_name : "",
      last_name: user?.profile?.last_name ? user.profile.last_name : "",
      nickname: user?.profile?.nickname ? user.profile.nickname : undefined,
      username: user?.profile?.username ? user.profile.username : undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { phone_number } = values;

    if (phone_number !== user?.profile?.phone_number) {
      setIsDifferentPhoneNumber(true);

      const sendOtpDto: SendOtpType = {
        method: "sms",
        phone_number: form.getValues("phone_number"),
        type: "update",
      };

      mutateSendOtp(sendOtpDto);

      setTempUserUpdate({
        first_name: form.getValues("first_name"),
        last_name: form.getValues("last_name"),
        address: form.getValues("address"),
        dob: form.getValues("dob"),
        phone_number: form.getValues("phone_number"),
        gender: form.getValues("gender"),
        nick_name: form.getValues("nickname"),
        username: form.getValues("username"),
      });

      return;
    }

    const updateUserProfileDto: UpdateUserProfile = {
      infoDetails: {
        ...values,
        ...(user?.profile?.bio && { bio: user.profile.bio }),
        dob: formatDateToString(values.dob),
        nickname:
          typeof values?.nickname === "string" &&
          values?.nickname?.trim() !== ""
            ? values.nickname
            : undefined,
      },
    };

    mutateUpdateProfile(updateUserProfileDto);
  }

  const handleCancelClick = () => {
    setIsModalEditProfileOpen(false);
    setIsDifferentPhoneNumber(false);
    resetUserEducations();
    if (onCancel) onCancel();

    setTimeout(() => {
      form.reset();
    }, 1000);
  };

  return (
    <>
      {isDifferentPhoneNumber === true ? (
        <section className="flex flex-col md:gap-3 gap-2 items-center justify-center">
          {user && user.profile && (
            <div className="flex flex-col text-center items-center justify-center md:gap-1 gap-0">
              <h1>Verify Your Phone Number</h1>

              <p className="text-gray-600">
                {" "}
                Enter the verification code (OTP) sent to your phone number{" "}
                <strong>
                  {formatPhoneNumber(form.getValues("phone_number"))}
                </strong>
              </p>
            </div>
          )}

          {tempUserUpdate && (
            <VerifyPhoneNumberOTPForm tempUserUpdateDto={tempUserUpdate} />
          )}
        </section>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col md:gap-3 gap-2"
          >
            <div className="grid md:grid-cols-2 grid-cols-1 md:gap:3 gap-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black dark:text-white">
                    Nick Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Senior Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 grid-cols-1 md:gap-3 gap-2">
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">
                      Phone number
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="0393873630" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="john_doe01" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 md:gap-3 gap-2">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">
                      Gender
                    </FormLabel>
                    <FormControl>
                      <Select
                        className="text-black"
                        placeholder="Female"
                        {...field}
                        defaultSelectedKeys={[`${user?.profile.gender}`]}
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string;
                          field.onChange(selected);
                        }}
                      >
                        {genders.map((gender) => (
                          <SelectItem key={gender.key} className="text-black">
                            {gender.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage className="text-red-600 md:text-left text-center" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">
                      Date of birth
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        hideTimeZone
                        showMonthAndYearPickers
                        aria-labelledby="date-and-time"
                        aria-label="date-and-time"
                        {...field}
                        inert={false}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 md:text-left text-center" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 Main Street, London, England"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 md:text-left text-center" />
                </FormItem>
              )}
            />

            <div className="flex items-center md:gap-2 gap-1 w-fit mx-auto">
              <Button
                color="primary"
                className="md:w-fit w-full mx-auto"
                onPress={handleCancelClick}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                color="primary"
                className="md:w-fit w-full mx-auto"
              >
                Update
              </Button>
            </div>

            <p className="text-center text-gray-700 dark:text-white/70 italic text-sm">
              Note: Click the Update button to save the changes you just made.
            </p>
          </form>
        </Form>
      )}
    </>
  );
};

export default EditDetailsInformationForm;
