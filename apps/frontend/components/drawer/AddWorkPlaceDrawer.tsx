"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUserStore } from "@/store";
import { formatDateToString } from "@/utils";
import {
  Button,
  DatePicker,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Input,
  useDisclosure,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { now, ZonedDateTime } from "@internationalized/date";
import { UserWorkPlacesType } from "@repo/db";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const formSchema = z
  .object({
    company_name: z.string().min(1, {
      message: "Name of company can't be empty.",
    }),
    position: z.string().min(1, {
      message: "Position can't be empty.",
    }),
    start_date: z.custom<ZonedDateTime>(
      (val) => {
        if (!val) return false;

        const today = now(val.timeZone);

        return val.compare(today) < 0;
      },
      {
        message: "Start date must be in the past.",
      },
    ),
    end_date: z.custom<ZonedDateTime>(() => true).optional(),
  })
  .superRefine((data, ctx) => {
    const { start_date, end_date } = data;

    if (end_date && start_date && end_date.compare(start_date) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date.",
        path: ["end_date"],
      });
    }
  });

const AddWorkPlaceDrawer = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { user, setUser } = useUserStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      position: "",
      start_date: undefined,
      end_date: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { position, company_name, start_date, end_date } = values;

    if (!user) return;

    const normalizedEndDate = end_date
      ? new Date(formatDateToString(end_date))
      : null;

    const data: UserWorkPlacesType = {
      id: `temp-${Date.now()}`,
      position,
      company_name,
      start_date: new Date(formatDateToString(start_date)),
      end_date: end_date ? normalizedEndDate : null,
      user_id: user.id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    setUser({
      ...user,
      work_places: [...user.work_places, data],
    });

    toast.success("New work place added successfully!");

    handleCancelClick();
  }

  const handleCancelClick = () => {
    onClose();
    setTimeout(() => {
      form.reset();
    }, 1000);
  };

  return (
    <>
      <Button
        color="secondary"
        startContent={<PlusCircle />}
        className="w-full"
        onPress={onOpen}
      >
        Add New Work Place
      </Button>

      <Drawer
        isOpen={isOpen}
        isDismissable={false}
        isKeyboardDismissDisabled={false}
        motionProps={{
          variants: {
            enter: {
              opacity: 1,
              x: 0,
              dur: 0.3,
            },
            exit: {
              x: 100,
              opacity: 0,
              dur: 0.3,
            },
          },
        }}
        onOpenChange={onOpenChange}
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="flex flex-col gap-1 text-center">
                <h1>Add New Work Place</h1>
                <p className="text-gray-600 font-normal dark:text-white/70">
                  Fill out the form to add a new work place record.
                </p>
              </DrawerHeader>
              <DrawerBody>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col md:gap-4 gap-3"
                  >
                    <FormField
                      control={form.control}
                      name="company_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">
                            Company Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="FPT Software" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-white text-black">
                            Position
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Backend Developer" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">
                            Start Date
                          </FormLabel>
                          <FormControl>
                            <DatePicker
                              hideTimeZone
                              showMonthAndYearPickers
                              aria-labelledby="start_date"
                              aria-label="start_date"
                              {...field}
                              inert={false}
                            />
                          </FormControl>
                          <FormMessage className="text-red-600 md:text-left text-center" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">
                            End Date (Optional)
                          </FormLabel>
                          <FormControl>
                            <DatePicker
                              hideTimeZone
                              showMonthAndYearPickers
                              aria-labelledby="end_date"
                              aria-label="end_date"
                              {...field}
                              inert={false}
                            />
                          </FormControl>
                          <FormMessage className="text-red-600 md:text-left text-center" />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center md:gap-2 gap-1 w-fit mx-auto">
                      <Button color="primary" onPress={handleCancelClick}>
                        Cancel
                      </Button>

                      <Button color="primary" type="submit">
                        Submit
                      </Button>
                    </div>
                  </form>
                </Form>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AddWorkPlaceDrawer;
