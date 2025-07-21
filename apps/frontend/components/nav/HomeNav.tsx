"use client";
import ConversationsDropdown from "@/components/ConversationsDropdown";
import SearchDropdown from "@/components/SearchDropdown";
import NotificationsTab from "@/components/tabs/NotificationsTab";
import { useSignOut, useUpdateTheme } from "@/hooks";
import { useUserStore } from "@/store";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Tooltip,
} from "@heroui/react";
import { ThemeEnum } from "@repo/db";
import {
  Contact,
  Grid2X2,
  HomeIcon,
  LaptopMinimal,
  MapPinHouse,
  Menu,
  MoonIcon,
  Sun,
  TvMinimal,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface HomeNavProps {
  shouldShowIndicator?: boolean;
}

const HomeNav: React.FC<HomeNavProps> = ({ shouldShowIndicator }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [, setIsHovering] = useState<boolean>(false);
  const isHoveringRef = useRef(false);
  const { user } = useUserStore();
  const { mutate: mutateSignOut } = useSignOut();
  const { mutate: mutateUpdateTheme, isPending } = useUpdateTheme();
  const [currentTheme, setCurrentTheme] = useState<string>(
    user?.profile?.theme ?? "system",
  );

  const menuItems = ["Profile", "Dashboard", "Activity", "Log Out"];

  const navItems = useMemo(
    () => [
      { icon: HomeIcon, label: "Home", redirectTo: "/home" },
      { icon: Contact, label: "Friends", redirectTo: "/friends" },
      { icon: UsersRound, label: "Communities", redirectTo: "/communities" },
      { icon: TvMinimal, label: "Video", redirectTo: "/video" },
      { icon: MapPinHouse, label: "Marketplace", redirectTo: "/marketplace" },
    ],
    [],
  );

  const updateIndicator = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    const { offsetLeft, clientWidth } = element;
    setIndicatorStyle({
      left: offsetLeft,
      width: clientWidth,
    });
  }, []);

  useEffect(() => {
    const foundIndex = navItems.findIndex((item) =>
      pathname.startsWith(item.redirectTo),
    );
    if (foundIndex !== -1) {
      setActiveIndex(foundIndex);
    }
  }, [pathname, navItems]);

  useEffect(() => {
    const el = itemsRef.current[activeIndex];
    if (el) {
      updateIndicator(el);
    }
  }, [activeIndex, updateIndicator]);

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

  const setItemRef = (index: number) => (el: HTMLDivElement | null) => {
    itemsRef.current[index] = el;
  };

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="2xl"
      isBordered
      height={"5rem"}
      isBlurred={false}
    >
      <NavbarContent justify="start" className="w-full">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />

        <NavbarBrand className="hidden md:flex">
          <Image
            src={"/icons/social-icon.svg"}
            sizes=""
            width={40}
            height={40}
            alt="icon"
            onClick={() => router.push("/home")}
            className="rounded-full cursor-pointer select-none dark:bg-white dark:border-none"
          />
        </NavbarBrand>
        <SearchDropdown />
      </NavbarContent>

      <NavbarContent
        as="div"
        className="hidden sm:flex gap-8 w-1/2 select-none"
        justify="center"
      >
        <NavbarMenuToggle
          icon={<Menu />}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />

        <div
          className="absolute bottom-4 h-1 bg-blue-500 transition-all duration-200 
          ease-[cubic-bezier(0.4,0,0.2,1)]"
          hidden={shouldShowIndicator ? false : true}
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            transform: "translateY(5px)",
          }}
        />

        {navItems.map(({ icon: Icon, label, redirectTo }, index) => (
          <div
            key={label}
            className="relative inline-block dark:text-white"
            ref={setItemRef(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              setActiveIndex(index);
              updateIndicator(itemsRef.current[index]);
              router.push(redirectTo);
            }}
          >
            <NavbarItem className="list-none px-4 py-2">
              <Tooltip
                showArrow
                content={label}
                className="text-black dark:text-white"
              >
                <div className="flex flex-col items-center">
                  <Icon
                    size={"30px"}
                    className={`focus:outline-none cursor-pointer transition-opacity ${
                      activeIndex === index
                        ? "opacity-100"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  />
                </div>
              </Tooltip>
            </NavbarItem>
          </div>
        ))}
      </NavbarContent>

      <NavbarContent as="div" justify="end">
        <Dropdown
          placement="bottom-end"
          className="text-black dark:text-white"
          shouldBlockScroll={false}
        >
          <DropdownTrigger>
            <LaptopMinimal className="focus:outline-none cursor-pointer dark:text-white" />
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Theme Actions"
            variant="flat"
            selectedKeys={[currentTheme]}
            selectionMode="single"
            onSelectionChange={(keys) => {
              const selectedTheme = Array.from(keys)[0]?.toString();
              if (!selectedTheme || selectedTheme === currentTheme || isPending)
                return;
              setCurrentTheme(selectedTheme);
              mutateUpdateTheme({
                theme: selectedTheme as ThemeEnum,
              });
            }}
          >
            <DropdownItem
              key="light"
              description="Light theme."
              startContent={<Sun />}
            >
              Light
            </DropdownItem>
            <DropdownItem
              key="dark"
              startContent={<MoonIcon />}
              description="Dark theme."
            >
              Dark
            </DropdownItem>
            <DropdownItem
              key="system"
              startContent={<TvMinimal />}
              description="System theme."
            >
              System
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Grid2X2 className="cursor-pointer dark:text-white" />

        <ConversationsDropdown />

        <NotificationsTab />

        {user && (
          <Dropdown
            placement="bottom-end"
            className="text-black dark:text-white"
            shouldBlockScroll={false}
          >
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform select-none"
                color="secondary"
                name={user.profile.first_name + " " + user.profile.last_name}
                size="md"
                src={user?.profile.avatar_url}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem
                key="profile"
                onPress={() => router.push(`/profile/${user.profile.username}`)}
              >
                View Profile
              </DropdownItem>
              <DropdownItem
                key="setting"
                onPress={() => router.push("/settings")}
              >
                Settings
              </DropdownItem>
              <DropdownItem
                key="log-out"
                color="danger"
                onPress={() => {
                  if (user.id.trim()) mutateSignOut(user.id);
                }}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </NavbarContent>

      <NavbarMenu className="h-full mt-3">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={
                index === 2
                  ? "primary"
                  : index === menuItems.length - 1
                    ? "danger"
                    : "foreground"
              }
              href="#"
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};

export default HomeNav;
