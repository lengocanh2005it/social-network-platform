"use client";
import EditImageButton from "@/components/button/EditImageButton";
import PeopleKnow from "@/components/PeopleKnow";
import { useAppStore, useUserStore } from "@/store";
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
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
import { useEffect, useRef, useState } from "react";

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
  const { user } = useUserStore();
  const { setIsModalEditProfileOpen } = useAppStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [, setIsHovering] = useState(false);
  const isHoveringRef = useRef(false);

  const updateIndicator = (element: HTMLElement | null) => {
    if (!element) return;

    const { offsetLeft, clientWidth } = element;
    setIndicatorStyle({
      left: offsetLeft,
      width: clientWidth,
    });
  };

  const handleMouseEnter = (index: number) => {
    isHoveringRef.current = true;
    setIsHovering(true);
    updateIndicator(itemsRef.current[index]);
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    setIsHovering(false);
    setTimeout(() => {
      if (!isHoveringRef.current) {
        updateIndicator(itemsRef.current[activeIndex]);
      }
    }, 500);
  };

  useEffect(() => {
    if (itemsRef.current[0]) {
      updateIndicator(itemsRef.current[0]);
      setActiveIndex(0);
    }
  }, []);

  const setItemRef = (index: number) => (el: HTMLDivElement | null) => {
    itemsRef.current[index] = el;
  };

  return (
    <>
      {user && (
        <>
          <div className="w-full h-full shadow pb-2 px-2 rounded-b-lg">
            <div
              className="h-60 w-full bg-gray-300 relative rounded-b-md cursor-pointer"
              style={{
                backgroundImage: `url(${user.profile.cover_photo_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <EditImageButton type="cover_photo" />
            </div>

            <div
              className="absolute bottom-4 h-1 bg-blue-500 transition-all duration-200 
          ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width - 5}px`,
                transform: "translate(10px, 5px)",
              }}
            />

            <div className="px-4 relative flex flex-col md:gap-3 gap-2 mt-4">
              <div className="flex items-start md:gap-3 gap-2">
                <div className="relative -mt-24">
                  <Image
                    src={user.profile.avatar_url}
                    alt="Avatar"
                    width={180}
                    height={180}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="rounded-full border-4 border-white object-cover 
                    select-none cursor-pointer"
                  />

                  <EditImageButton type="avatar" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center md:gap-2 gap-1">
                      <h1 className="md:text-3xl font-bold text-2xl">
                        {user.profile.first_name + " " + user.profile.last_name}
                      </h1>

                      {user.profile.nickname && (
                        <p className="md:text-lg text-medium text-gray-600">
                          ({user.profile.nickname})
                        </p>
                      )}
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
                      onPress={() => setIsModalEditProfileOpen(true)}
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

              <Divider />

              <div className="flex items-center md:gap-3 gap-2 justify-between">
                <div className="flex items-center md:gap-3 gap-2">
                  {headersOptions.map((option, index) => (
                    <div
                      key={option.key}
                      ref={setItemRef(index)}
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Link
                        href={"/"}
                        className="px-4 py-3 font-medium text-gray-700"
                      >
                        {option.label}
                      </Link>
                    </div>
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
                    <DropdownItem
                      key="create-profile"
                      startContent={<PlusCircle />}
                    >
                      Create another profile
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProfileHeaderSection;
