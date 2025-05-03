"use client";
import PeopleKnow from "@/components/PeopleKnow";
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from "@heroui/react";
import {
  CameraIcon,
  ChevronDown,
  ChevronUp,
  Edit,
  Ellipsis,
  Eye,
  Lock,
  Plus,
  PlusCircle,
  Search,
  Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const headersOptions = [
  {
    key: 1,
    label: "Posts",
  },
  {
    key: 2,
    label: "About",
  },
  {
    key: 3,
    label: "Friends",
  },
  {
    key: 4,
    label: "Photos",
  },
  {
    key: 5,
    label: "Videos",
  },
  {
    key: 6,
    label: "Check-ins",
  },
];

const ProfileHeaderSection = () => {
  const [isShowPeopleKnow, setIsShowPeopleKnow] = useState<boolean>(false);

  return (
    <div className="w-full h-full shadow pb-2 px-2 rounded-b-lg">
      <div
        className="h-60 w-full bg-gray-300 relative rounded-b-md"
        style={{
          backgroundImage:
            "url('https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//default-cover-photo.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Button
          startContent={<CameraIcon />}
          className="absolute bottom-4 right-4 bg-white
        text-black px-3 py-1 rounded-md flex items-center gap-1 transition"
        >
          Edit cover photo
        </Button>
      </div>

      <div className="px-4 relative flex flex-col md:gap-3 gap-2 mt-4">
        <div className="flex items-start md:gap-3 gap-2">
          <div className="relative -mt-24">
            <Image
              src="https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png"
              alt="Avatar"
              width={180}
              height={180}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-full border-4 border-white object-cover select-none cursor-pointer"
            />

            <Tooltip content="Edit avatar">
              <Button
                isIconOnly
                className="absolute bottom-3 right-3 bg-gray-400 text-white p-2
            rounded-full hover:bg-gray-500 transition"
              >
                <CameraIcon />
              </Button>
            </Tooltip>
          </div>

          <div className="flex-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center md:gap-2 gap-1">
                <h1 className="md:text-3xl font-bold text-2xl">John Doe</h1>
                <p className="md:text-2xl text-xl font-medium">
                  (Software Engineer)
                </p>
              </div>

              <p className="text-gray-600">1000 friends</p>
            </div>

            <div className="flex gap-2 justify-end items-start">
              <Button
                startContent={<Plus className="focus:outline-none" />}
                className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
              >
                Add to story
              </Button>

              <Button
                startContent={<Edit className="focus:outline-none" />}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-sm"
              >
                Edit Profile
              </Button>

              <Button
                isIconOnly
                startContent={
                  isShowPeopleKnow ? (
                    <ChevronUp className="focus:outline-none" />
                  ) : (
                    <ChevronDown className="focus:outline-none" />
                  )
                }
                onPress={() => setIsShowPeopleKnow(!isShowPeopleKnow)}
              />
            </div>
          </div>
        </div>

        {isShowPeopleKnow && <PeopleKnow />}

        <Divider className="" />

        <div className="flex items-center md:gap-3 gap-2 justify-between">
          <div className="flex items-center md:gap-3 gap-2">
            {headersOptions.map((option) => (
              <Link
                href={"/"}
                key={option.key}
                className="px-4 py-3 font-medium text-gray-700 border-b-2 border-transparent
               hover:border-blue-500"
              >
                {option.label}
              </Link>
            ))}

            <Dropdown
              placement="bottom-end"
              className="text-black"
              shouldBlockScroll={false}
            >
              <DropdownTrigger>
                <Button
                  endContent={
                    <ChevronDown className="text-gray-700 focus:outline-none" />
                  }
                  className="bg-transparent text-gray-700"
                >
                  More
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="" variant="flat">
                <DropdownItem key="like">Likes</DropdownItem>
                <DropdownItem key="Groups">Groups</DropdownItem>
                <DropdownItem key="app-game">Apps and games</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          <Dropdown
            placement="bottom-end"
            className="text-black"
            shouldBlockScroll={false}
          >
            <DropdownTrigger>
              <Button isIconOnly className="bg-transparent">
                <Ellipsis className="text-gray-700 focus:outline-none" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="" variant="flat">
              <DropdownItem key="view-as" startContent={<Eye />}>
                View As
              </DropdownItem>
              <DropdownItem key="search" startContent={<Search />}>
                Search
              </DropdownItem>
              <DropdownItem key="status" startContent={<Shield />}>
                Profile status
              </DropdownItem>
              <DropdownItem key="lock-profile" startContent={<Lock />}>
                Lock profile
              </DropdownItem>
              <DropdownItem key="create-profile" startContent={<PlusCircle />}>
                Create another profile
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderSection;
