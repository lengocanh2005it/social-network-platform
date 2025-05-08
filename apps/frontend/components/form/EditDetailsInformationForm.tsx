"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUpdateProfile } from "@/hooks";
import { useAppStore, useUserStore } from "@/store";
import {
  formatDateToString,
  genders,
  toZonedDate,
  UpdateUserProfile,
} from "@/utils";
import { Button, DatePicker, Input, Select, SelectItem } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { now, ZonedDateTime } from "@internationalized/date";
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
});

const EditDetailsInformationForm = () => {
  const { user, resetUserEducations } = useUserStore();
  const { setIsModalEditProfileOpen } = useAppStore();
  const { mutate: mutateUpdateProfile } = useUpdateProfile();

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
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updateUserProfileDto: UpdateUserProfile = {
      infoDetails: {
        ...values,
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
    resetUserEducations();

    setTimeout(() => {
      form.reset();
    }, 1000);
  };

  return (
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
                <FormLabel>First Name</FormLabel>
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
                <FormLabel>Last Name</FormLabel>
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
              <FormLabel>Nick Name</FormLabel>
              <FormControl>
                <Input placeholder="Senior Software Engineer" {...field} />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input placeholder="0393873630" {...field} />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 grid-cols-1 md:gap-3 gap-2">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Gender</FormLabel>
                <FormControl>
                  <Select
                    className="text-black"
                    placeholder="Female"
                    {...field}
                    defaultSelectedKeys={[`${user?.profile.gender}`]}
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
                <FormLabel className="text-black">Date of birth</FormLabel>
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

        <p className="text-center text-gray-700 italic text-sm">
          Note: Click the Update button to save the changes you just made.
        </p>
      </form>
    </Form>
  );
};

export default EditDetailsInformationForm;
