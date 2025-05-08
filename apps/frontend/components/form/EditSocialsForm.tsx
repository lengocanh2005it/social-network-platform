"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import GitHubIcon from "@/components/ui/icons/github";
import InstagramIcon from "@/components/ui/icons/instagram";
import TwitterIcon from "@/components/ui/icons/twitter";
import { useUpdateProfile } from "@/hooks";
import { useAppStore, useUserStore } from "@/store";
import { UpdateUserProfile } from "@/utils";
import { Button, Input } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  github_link: z.string().optional(),
  twitter_link: z.string().optional(),
  instagram_link: z.string().optional(),
});

const EditSocialsForm = () => {
  const { user, resetUserEducations } = useUserStore();
  const { setIsModalEditProfileOpen } = useAppStore();
  const { mutate: mutateUpdateProfile } = useUpdateProfile();

  const github = user?.socials.find(
    (s) => s.social_name === "github" && s.user_id === user.id,
  );

  const twitter = user?.socials.find(
    (s) => s.social_name === "twitter" && s.user_id === user.id,
  );

  const instagram = user?.socials.find(
    (s) => s.social_name === "instagram" && s.user_id === user.id,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      github_link: github?.social_link ?? undefined,
      twitter_link: twitter?.social_link ?? undefined,
      instagram_link: instagram?.social_link ?? undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { github_link, twitter_link, instagram_link } = values;

    const updateUserProfileDto: UpdateUserProfile = {
      socials: {
        github_link:
          typeof github_link === "string" && github_link.trim() !== ""
            ? github_link
            : undefined,
        twitter_link:
          typeof twitter_link === "string" && twitter_link.trim() !== ""
            ? twitter_link
            : undefined,
        instagram_link:
          typeof instagram_link === "string" && instagram_link.trim() !== ""
            ? instagram_link
            : undefined,
      },
    };

    mutateUpdateProfile(updateUserProfileDto);
  }

  const handleCancel = () => {
    setIsModalEditProfileOpen(false);

    setTimeout(() => {
      form.reset();
      resetUserEducations();
    }, 1000);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col md:gap-4 gap-3"
      >
        <FormField
          control={form.control}
          name="github_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Github</FormLabel>
              <FormControl>
                <Input
                  startContent={<GitHubIcon width={22} height={22} />}
                  placeholder="https://github.com/lengocanh2005it"
                  {...field}
                  value={field.value}
                  onChange={field.onChange}
                  onClear={() => {
                    form.setValue("github_link", "");
                    form.trigger("github_link");
                  }}
                />
              </FormControl>
              <FormMessage className="text-red-600 md:text-left text-center" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="twitter_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Twitter</FormLabel>
              <FormControl>
                <Input
                  startContent={<TwitterIcon width={22} height={22} />}
                  placeholder="https://github.com/lengocanh2005it"
                  {...field}
                  value={field.value}
                  onChange={field.onChange}
                  onClear={() => {
                    form.setValue("twitter_link", "");
                    form.trigger("twitter_link");
                  }}
                />
              </FormControl>
              <FormMessage className="text-red-600 md:text-left text-center" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instagram_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram</FormLabel>
              <FormControl>
                <Input
                  startContent={<InstagramIcon width={22} height={22} />}
                  placeholder="https://github.com/lengocanh2005it"
                  {...field}
                  value={field.value}
                  onChange={field.onChange}
                  onClear={() => {
                    form.setValue("instagram_link", "");
                    form.trigger("instagram_link");
                  }}
                />
              </FormControl>
              <FormMessage className="text-red-600 md:text-left text-center" />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-center md:gap-3 gap-2">
          <Button color="primary" onPress={handleCancel}>
            Cancel
          </Button>

          <Button type="submit" color="primary">
            Submit
          </Button>
        </div>

        <p className="text-center text-gray-700 italic text-sm">
          Note: Click the Update button to save the changes you just made.
        </p>
      </form>
    </Form>
  );
};

export default EditSocialsForm;
