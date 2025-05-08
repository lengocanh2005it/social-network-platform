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
import { formatDateToString, toZonedDate, WorkPlace } from "@/utils";
import {
  Button,
  DatePicker,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Input,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  now,
  parseZonedDateTime,
  ZonedDateTime,
} from "@internationalized/date";
import { UserWorkPlacesType } from "@repo/db";
import { EditIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z
  .object({
    position: z.string().min(1, {
      message: "Position can't be empty.",
    }),
    company_name: z.string().min(1, {
      message: "Name of company can't be empty.",
    }),
    start_date: z.custom<ZonedDateTime>(
      (val) => {
        if (!val) return false;

        let zoned: ZonedDateTime;

        try {
          zoned = typeof val === "string" ? parseZonedDateTime(val) : val;
        } catch {
          return false;
        }

        const today = now(zoned.timeZone);

        return zoned.compare(today) < 0;
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

interface EditWorkPlaceDrawerProps {
  workPlace: WorkPlace;
}

const EditWorkPlaceDrawer: React.FC<EditWorkPlaceDrawerProps> = ({
  workPlace,
}) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { updateUserWorkPlace } = useUserStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: workPlace.position,
      company_name: workPlace.company_name,
      start_date: toZonedDate(
        typeof workPlace.start_date === "string"
          ? new Date(workPlace.start_date)
          : undefined,
      ),
      end_date: workPlace?.end_date
        ? toZonedDate(new Date(workPlace.end_date))
        : undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { position, company_name, start_date, end_date } = values;

    const newUserWorkPlaceData: Partial<UserWorkPlacesType> = {
      position,
      company_name,
      start_date: new Date(formatDateToString(start_date)),
      ...(end_date && { end_date: new Date(formatDateToString(end_date)) }),
    };

    updateUserWorkPlace(workPlace.id, newUserWorkPlaceData);

    onClose();
  }

  const handleCancelClick = () => {
    onClose();

    setTimeout(() => {
      form.reset();
    }, 1000);
  };

  return (
    <>
      <Tooltip content="Update">
        <EditIcon
          className="cursor-pointer focus:outline-none"
          onClick={onOpen}
        />
      </Tooltip>

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
                <h1>Edit Your Work Place</h1>
                <p className="text-gray-600 font-normal">
                  Update the form below to edit your work place details.
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
                          <FormLabel>Company Name</FormLabel>
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
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input placeholder="Software Engineer" {...field} />
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
                          <FormLabel className="text-black">
                            Start date
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
                          <FormLabel className="text-black">
                            End date (Optional)
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

export default EditWorkPlaceDrawer;
