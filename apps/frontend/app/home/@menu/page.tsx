"use client";
import { Divider, ScrollShadow, User } from "@heroui/react";
import {
  BadgeHelp,
  Contact,
  LogOut,
  MapPinHouse,
  Settings,
  UsersRound,
} from "lucide-react";

const categories = [
  {
    key: 1,
    icon: <Contact />,
    content: "Friends",
  },
  {
    key: 2,
    icon: <UsersRound />,
    content: "Groups",
  },
  {
    key: 3,
    icon: <MapPinHouse />,
    content: "Marketplace",
  },
];

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
  return (
    <main className="flex flex-col w-full justify-between">
      <section className="flex flex-col md:gap-4 gap-2 w-full">
        <div
          className="hover:bg-gray-200 flex items-center p-2 rounded-md
        transition-all ease-in-out duration-300 cursor-pointer"
        >
          <User
            avatarProps={{
              src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
            }}
            name="Jane Doe"
            className="select-none"
          />
        </div>

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

      <section className="flex flex-col justify-between">
        <h3 className="text-black/70 px-2 py-2">Your groups</h3>

        <ScrollShadow
          hideScrollBar
          className="min-h-[350px] max-h-[400px]"
          offset={0}
          size={0}
        >
          {[
            "NestJS Developer Community",
            "Code Your Life as Developer",
            "TOEIC Writing And Speaking Test",
            "Fullstack Developer Intern",
            "Next.js Developers Team",
            "FPT Software Interships",
            "Code Love Communities",
            "Backend Developers Senior",
            "Backend Developers Senior",
            "Backend Developers Senior",
            "Backend Developers Senior",
          ].map((group, index) => (
            <div
              key={index}
              className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              <div
                className="w-8 h-8 min-w-[2rem] bg-blue-100 rounded-full mr-2 flex
               items-center justify-center text-blue-500 select-none"
              >
                {group.charAt(0)}
              </div>

              <span className="break-words text-sm leading-snug max-w-[calc(100%-2.5rem)]">
                {group}
              </span>
            </div>
          ))}
        </ScrollShadow>

        <Divider className="md:my-3 my-2" />

        <div>
          <h3 className="text-black/70 px-2 py-2">Others</h3>

          <div className="text-sm text-gray-500 px-2 py-2">
            {settings.map((setting) => (
              <div
                key={setting.key}
                className="flex group items-center gap-1 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
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
