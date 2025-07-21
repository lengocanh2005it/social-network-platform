"use client";
import BasicInformation from "@/components/BasicInformation";
import EditProfileModal from "@/components/modal/EditProfileModal";
import SocialsIntro from "@/components/SocialsIntro";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useUpdateProfile } from "@/hooks";
import { useAppStore, useUserStore } from "@/store";
import { UpdateUserProfile } from "@/utils";
import { Button, Textarea } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  bio: z.string().optional(),
});

const ProfileIntroSection = () => {
  const { user, viewedUser } = useUserStore();
  const { setIsModalEditProfileOpen, isModalEditProfileOpen } = useAppStore();
  const [isClickedAddBio, setIsClickedAddBio] = useState<boolean>(false);
  const { mutate: mutateUpdateProfile } = useUpdateProfile();

  const handleClickAddBio = () => setIsClickedAddBio(!isClickedAddBio);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: user?.profile?.bio ? user.profile.bio : undefined,
    },
  });

  useEffect(() => {
    if (user?.profile?.bio) {
      form.reset({ bio: user.profile.bio });
    } else {
      form.reset({ bio: undefined });
    }
  }, [user, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !user.profile) return;

    const { bio } = values;

    const updateProfileDto: UpdateUserProfile = {
      infoDetails: {
        phone_number: user.profile.phone_number,
        dob: new Date(user.profile.dob).toISOString(),
        nickname: user.profile.nickname ? user.profile.nickname : undefined,
        gender: user.profile.gender,
        address: user.profile.address,
        first_name: user.profile.first_name,
        last_name: user.profile.last_name,
        bio: typeof bio === "string" && bio.trim() !== "" ? bio : undefined,
        username: user.profile.username,
      },
    };

    mutateUpdateProfile(updateProfileDto);

    form.reset();

    setIsClickedAddBio(false);
  }

  return (
    <>
      <section
        className={`w-full flex flex-col dark:text-white dark:bg-black ${viewedUser?.id !== user?.id ? "md:gap-2" : "md:gap-3"} gap-2`}
      >
        <h1 className="font-medium md:text-xl text-lg">Intro</h1>

        {viewedUser?.id !== user?.id ? (
          <>
            {viewedUser?.profile?.bio && (
              <div className="w-full flex-1 flex flex-col md:p-3 p-2 md:gap-2 gap-1">
                <p className="text-center text-gray-700">
                  {viewedUser?.profile?.bio}
                </p>

                {user?.id === viewedUser?.id && (
                  <Button
                    color="primary"
                    onPress={() => setIsClickedAddBio(true)}
                  >
                    Edit bio
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {!isClickedAddBio ? (
              <>
                {user?.profile?.bio && (
                  <div className="w-full flex-1 flex flex-col md:p-3 p-2 md:gap-2 gap-1">
                    <p className="text-center text-gray-700 dark:text-white/80">
                      {user?.profile?.bio}
                    </p>

                    <Button
                      color="primary"
                      onPress={() => setIsClickedAddBio(true)}
                    >
                      Edit bio
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col md:gap-3 gap-2"
                  >
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Write your bio..."
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center w-full md:gap-2 gap-1">
                      <Button
                        color="primary"
                        className="flex-1"
                        onPress={() => setIsClickedAddBio(false)}
                      >
                        Cancel
                      </Button>

                      <Button type="submit" color="primary" className="flex-1">
                        Save
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            )}

            {!isClickedAddBio &&
              (user?.profile?.bio?.trim() === "" || !user?.profile?.bio) && (
                <Button color="primary" onPress={handleClickAddBio}>
                  Add bio
                </Button>
              )}
          </>
        )}

        {viewedUser?.profile && <BasicInformation />}

        {viewedUser?.educations.length !== 0 ||
        viewedUser?.socials?.length !== 0 ||
        viewedUser?.work_places?.length !== 0 ? (
          <>
            <SocialsIntro />
          </>
        ) : (
          <>
            {viewedUser?.id === user?.id && (
              <Button
                color="primary"
                onPress={() => setIsModalEditProfileOpen(true)}
              >
                Edit details
              </Button>
            )}
          </>
        )}
      </section>

      {isModalEditProfileOpen && <EditProfileModal />}
    </>
  );
};

export default ProfileIntroSection;
