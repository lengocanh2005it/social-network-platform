"use client";
import BookMarksList from "@/components/BookMarksList";
import { useGetBookMarks } from "@/hooks";
import { useBookMarkStore, useUserStore } from "@/store";
import { Divider, User } from "@heroui/react";
import {
  BadgeHelp,
  Bell,
  BookmarkIcon,
  Contact,
  LogOut,
  MapPinHouse,
  MessagesSquare,
  Newspaper,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const settings = [
  { key: 1, icon: <Settings />, content: "Settings & Privacy" },
  {
    key: 2,
    icon: <BadgeHelp />,
    content: "Help & Support",
  },
  {
    key: 3,
    icon: <LogOut />,
    content: "Logout",
  },
];

const MenuPage = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const { data } = useGetBookMarks(user?.id ?? "", {});
  const { bookmarks, setBookMarks } = useBookMarkStore();

  useEffect(() => {
    if (data) {
      if (data?.data?.length) setBookMarks(data?.data);
    }
  }, [data, setBookMarks]);

  const categories = [
    {
      key: 1,
      icon: <Contact />,
      content: "Friends",
    },
    {
      key: 2,
      icon: <BookmarkIcon />,
      content: "Bookmarks",
    },
    {
      key: 3,
      icon: <MessagesSquare />,
      content: "Messages",
    },
    {
      key: 5,
      icon: <Bell />,
      content: "Notifications",
    },
    {
      key: 6,
      icon: <MapPinHouse />,
      content: "Marketplace",
    },
    {
      key: 7,
      icon: <Newspaper />,
      content: "Feed",
    },
  ];

  return (
    <main className="flex flex-col w-full justify-between h-full">
      <section className="flex flex-col md:gap-4 gap-2 w-full">
        <div
          className="hover:bg-gray-200 flex items-center p-2 rounded-md
        transition-all ease-in-out duration-300 cursor-pointer"
          onClick={() => router.push(`/profile/${user?.profile?.username}`)}
        >
          {user && (
            <User
              avatarProps={{
                src: user.profile.avatar_url,
                alt: user.profile.first_name + " " + user.profile.last_name,
              }}
              name={user.profile.first_name + " " + user.profile.last_name}
              className="select-none"
            />
          )}
        </div>

        <Divider />

        <div className="flex flex-col">
          <h3 className="text-black/70 px-2 py-2">Your shortcuts</h3>

          <div className="flex flex-col md:gap-3 gap-2 w-full">
            {categories.map((category) => (
              <div
                key={category.key}
                className="flex w-full items-center cursor-pointer md:gap-3 
              gap-2 p-2 rounded-md hover:bg-gray-200 transition-all ease-in-out duration-300"
              >
                {category.icon}
                <p>{category.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider className="md:my-3 my-2" />

      <section className="flex flex-col justify-between w-full">
        {bookmarks?.length !== 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-black/70 px-2 py-2">Your bookmarks</h3>

              <Link
                href={`/profile/${user?.profile?.username}/?tab=bookmarks`}
                className="text-blue-600 hover:underline"
              >
                See details
              </Link>
            </div>
            <BookMarksList bookMarks={bookmarks} />
            <Divider className="md:my-3 my-2" />
          </>
        ) : (
          <></>
        )}

        <div>
          <h3 className="text-black/70 px-2">Others</h3>

          <div className="text-sm text-gray-500 py-2 flex flex-col gap-1">
            {settings.map((setting) => (
              <div
                key={setting.key}
                className="flex group items-center gap-1 p-2 hover:bg-gray-100 
                rounded-lg cursor-pointer"
              >
                {setting.icon}

                <p className="cursor-pointer group-hover:text-black">
                  {setting.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default MenuPage;
