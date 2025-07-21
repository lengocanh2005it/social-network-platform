"use client";
import EditImageButton from "@/components/button/EditImageButton";
import ChatBox from "@/components/chatbox/ChatBox";
import CreateStoryModal from "@/components/modal/CreateStoryModal";
import PeopleKnow from "@/components/PeopleKnow";
import {
  useBlockUser,
  useCreateFriendRequest,
  useDeleteFriendRequest,
  useResponseToFriendRequest,
} from "@/hooks";
import {
  FullUserType,
  useAppStore,
  useFriendStore,
  useUserStore,
} from "@/store";
import {
  BlockUserType,
  CreateFriendRequestType,
  Friend,
  RelationshipType,
  ResponseFriendRequestAction,
  ResponseFriendRequestType,
} from "@/utils";
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
  BellRing,
  Check,
  ChevronDown,
  ChevronUp,
  Edit,
  Ellipsis,
  Eye,
  Lock,
  MessagesSquare,
  Plus,
  PlusCircle,
  Search,
  Shield,
  UserLock,
  UserPlus,
  UserRoundX,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

const ProfileHeaderSection = () => {
  const [isShowPeopleKnow, setIsShowPeopleKnow] = useState<boolean>(false);
  const { viewedUser, user, relationship, setRelationship, setUser } =
    useUserStore();
  const { setIsModalEditProfileOpen } = useAppStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [, setIsHovering] = useState(false);
  const isHoveringRef = useRef(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { mutate: mutateCreateFriendRequest, isPending } =
    useCreateFriendRequest();
  const {
    mutate: mutateDeleteFriendRequest,
    isPending: isDeleteRequestPending,
  } = useDeleteFriendRequest();
  const { mutate: mutateResponseToFriendRequest } =
    useResponseToFriendRequest();
  const { mutate: mutateBlockUser } = useBlockUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { openChat } = useFriendStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const isCurrentUser = viewedUser?.id === user?.id;
  const headersOptions = useMemo(
    () => [
      {
        key: 1,
        label: "Posts",
        href: `/profile/${!isCurrentUser ? `${viewedUser?.profile.username}` : `${user?.profile.username}`}`,
      },
      {
        key: 2,
        label: "About",
        href: "/",
      },
      {
        key: 3,
        label: "Friends",
        href: `/profile/${!isCurrentUser ? `${viewedUser?.profile.username}` : `${user?.profile.username}`}/?tab=friends`,
      },
      {
        key: 4,
        label: "Photos",
        href: `/profile/${!isCurrentUser ? `${viewedUser?.profile.username}` : `${user?.profile.username}`}/?tab=photos`,
      },
      {
        key: 5,
        label: "Videos",
        href: "/",
      },
      {
        key: 6,
        label: "Check-ins",
        href: "/",
      },
      ...(viewedUser?.id === user?.id
        ? [
            {
              key: 7,
              label: "Bookmarks",
              href: `/profile/${!isCurrentUser ? `${viewedUser?.profile.username}` : `${user?.profile.username}`}/?tab=bookmarks`,
            },
          ]
        : []),
    ],
    [
      user?.profile?.username,
      viewedUser?.profile?.username,
      isCurrentUser,
      user?.id,
      viewedUser?.id,
    ],
  );

  useEffect(() => {
    if (!itemsRef.current.length) return;

    if (tab) {
      const targetIndex = headersOptions.findIndex((option) =>
        option.href.includes(`tab=${tab}`),
      );
      if (targetIndex !== -1) {
        setActiveIndex(targetIndex);
        updateIndicator(itemsRef.current[targetIndex]);
      } else {
        setActiveIndex(0);
        updateIndicator(itemsRef.current[0]);
      }
    } else {
      setActiveIndex(0);
      updateIndicator(itemsRef.current[0]);
    }
  }, [
    tab,
    viewedUser?.profile?.username,
    user?.profile?.username,
    headersOptions,
  ]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const setItemRef = (index: number) => (el: HTMLDivElement | null) => {
    itemsRef.current[index] = el;
  };

  const handleAddNewFriendClick = () => {
    if (!viewedUser?.id) return;

    const createFriendRequestDto: CreateFriendRequestType = {
      target_id: viewedUser.id,
    };

    mutateCreateFriendRequest(createFriendRequestDto, {
      onSuccess: (data: RelationshipType) => {
        if (data) {
          toast.success("Friend request has been sent to this user.", {
            position: "bottom-right",
          });

          setRelationship(data);
        }
      },
    });
  };

  const handleDeleteFriendRequest = () => {
    if (!viewedUser?.id) return;

    mutateDeleteFriendRequest(viewedUser.id, {
      onSuccess: (data: RelationshipType) => {
        if (data) {
          toast.success("Friend request has been canceled.", {
            position: "bottom-right",
          });

          setRelationship(data);
        }
      },
    });
  };

  const handleDeleteFriend = () => {
    if (!viewedUser?.id) return;

    mutateDeleteFriendRequest(viewedUser.id, {
      onSuccess: (data: RelationshipType) => {
        if (data) {
          toast.success("Successfully unfriended this person!", {
            position: "bottom-right",
          });

          setRelationship(data);

          if (user) {
            setUser({
              ...user,
              total_friends: user?.total_friends - 1,
            });
          }
        }
      },
    });
  };

  const responseToFriendRequest = async (
    action: ResponseFriendRequestAction,
  ) => {
    if (!viewedUser?.id || !user?.id) return;

    const responseToFriendRequestDto: ResponseFriendRequestType = {
      action,
      initiator_id: viewedUser?.id,
    };

    mutateResponseToFriendRequest(responseToFriendRequestDto, {
      onSuccess: (data: RelationshipType, variables) => {
        if (data) {
          const { action } = variables;

          const fullName = `${viewedUser.profile.first_name} ${viewedUser.profile.last_name}`;

          if (action === ResponseFriendRequestAction.ACCEPT) {
            toast.success(`You are now friends with ${fullName}!`, {
              position: "bottom-right",
            });
          } else if (action === ResponseFriendRequestAction.REJECT) {
            toast.success(
              `You have declined the friend request from ${fullName}.`,
              {
                position: "bottom-right",
              },
            );
          }

          setRelationship(data);
          setOpen(false);
        }
      },
    });
  };

  const blockUserClick = (user: FullUserType) => {
    const blockUserData: BlockUserType = {
      targetId: user.id,
    };

    mutateBlockUser(blockUserData, {
      onSuccess: (data: Record<string, string | boolean>) => {
        if (data) {
          router.push("/home");

          toast.success(
            `You have successfully blocked the user ${user.profile.first_name + " " + user.profile.last_name}.`,
            {
              position: "bottom-right",
            },
          );
        }
      },
    });
  };

  const handleMessageClick = () => {
    if (!viewedUser) return;

    const friend: Friend = {
      user_id: viewedUser.id,
      full_name: `${viewedUser.profile.first_name} ${viewedUser.profile.last_name}`,
      username: viewedUser.profile.username,
      mutual_friends: 0,
      avatar_url: viewedUser.profile.avatar_url,
      is_friend: true,
    };

    openChat(friend);
  };

  return (
    <>
      {viewedUser && (
        <>
          <div
            className="w-full h-full shadow pb-2 px-2 rounded-b-lg dark:bg-black dark:text-white
          dark:border dark:border-white/20"
          >
            <PhotoProvider>
              <PhotoView
                src={
                  !isCurrentUser
                    ? viewedUser.profile.cover_photo_url
                    : user?.profile.cover_photo_url
                }
              >
                <div
                  className="h-60 w-full bg-gray-300 dark:bg-black dark:text-white 
                  relative rounded-b-md cursor-pointer"
                  style={{
                    backgroundImage: `url(${
                      !isCurrentUser
                        ? viewedUser.profile.cover_photo_url
                        : user?.profile.cover_photo_url
                    })`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {isCurrentUser && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <EditImageButton type="cover_photo" />
                    </div>
                  )}
                </div>
              </PhotoView>
            </PhotoProvider>

            <div
              className="absolute bottom-4 h-1 bg-blue-500 dark:bg-blue-700 transition-all duration-200 
          ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width - 5}px`,
                transform: "translate(10px, 5px)",
              }}
            />

            <div className="px-4 relative flex flex-col md:gap-3 gap-2 mt-4">
              <div className="flex items-start md:gap-3 gap-2">
                <PhotoProvider>
                  <div className="relative -mt-24">
                    <PhotoView
                      src={
                        (!isCurrentUser
                          ? viewedUser.profile.avatar_url
                          : user?.profile.avatar_url) ?? ""
                      }
                    >
                      <Image
                        src={
                          (!isCurrentUser
                            ? viewedUser.profile.avatar_url
                            : user?.profile.avatar_url) ?? ""
                        }
                        alt="Avatar"
                        width={180}
                        height={180}
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="rounded-full border-4 border-white dark:border-black object-cover 
                    select-none cursor-pointer"
                      />
                    </PhotoView>

                    {isCurrentUser && <EditImageButton type="avatar" />}
                  </div>
                </PhotoProvider>

                <div className="flex-1 relative">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center md:gap-2 gap-1">
                      <h1 className="md:text-3xl font-bold text-2xl">
                        {!isCurrentUser
                          ? `${
                              viewedUser.profile.first_name +
                              " " +
                              viewedUser.profile.last_name
                            }`
                          : `${
                              user?.profile.first_name +
                              " " +
                              user?.profile.last_name
                            }`}
                      </h1>

                      {isCurrentUser ? (
                        <>
                          {user?.profile?.nickname && (
                            <p className="md:text-lg text-medium text-gray-600 dark:text-white/70">
                              ({user?.profile?.nickname})
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          {viewedUser.profile.nickname && (
                            <p className="md:text-lg text-medium text-gray-600 dark:text-white/70">
                              ({viewedUser.profile.nickname})
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {!isCurrentUser ? (
                      <>
                        {viewedUser?.total_friends > 0 && (
                          <p className="text-gray-600 dark:text-white/80">
                            {viewedUser?.total_friends} friends
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        {user && user?.total_friends > 0 && (
                          <p className="text-gray-600 dark:text-white/80">
                            {user?.total_friends ?? 0} friends
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {isCurrentUser ? (
                    <div className="flex gap-2 justify-end items-start">
                      <Button
                        startContent={<Plus className="focus:outline-none" />}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 
                      rounded-md text-sm dark:bg-blue-700 dark:text-white"
                        onPress={() => setIsOpen(true)}
                      >
                        Add to story
                      </Button>

                      <Button
                        startContent={<Edit className="focus:outline-none" />}
                        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-sm
                        dark:bg-white dark:text-black"
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
                  ) : (
                    <div className="flex justify-end items-center md:gap-2 gap-1">
                      {relationship && (
                        <div className="flex gap-2 justify-end items-start">
                          {relationship.status === "none" && (
                            <>
                              {isPending ? (
                                <Button
                                  className="bg-blue-500 hover:bg-blue-700 text-white 
                                px-3 py-1 rounded-md text-sm dark:bg-blue-700 dark:hover:bg-blue-800"
                                  isLoading
                                >
                                  Please wait...
                                </Button>
                              ) : (
                                <Button
                                  startContent={<UserPlus />}
                                  className="bg-blue-500 hover:bg-blue-700 text-white 
                                px-3 py-1 rounded-md text-sm dark:bg-blue-700 dark:hover:bg-blue-800"
                                  onPress={handleAddNewFriendClick}
                                >
                                  Add new friend
                                </Button>
                              )}
                            </>
                          )}

                          {relationship.status === "accepted" && (
                            <>
                              {isDeleteRequestPending ? (
                                <Button color="primary" isLoading>
                                  Please wait...
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    color="primary"
                                    startContent={<UserRoundX />}
                                    onPress={handleDeleteFriend}
                                  >
                                    Unfriend
                                  </Button>
                                </>
                              )}

                              <Button
                                startContent={<MessagesSquare />}
                                className="bg-blue-500 hover:bg-blue-700 text-white px-3 
                                py-1 rounded-md text-sm dark:bg-blue-700 dark:hover:bg-blue-800"
                                onPress={handleMessageClick}
                              >
                                Message
                              </Button>
                            </>
                          )}

                          {relationship.status === "pending" &&
                            relationship.isInitiator && (
                              <>
                                {isDeleteRequestPending ? (
                                  <Button
                                    className="bg-blue-500 hover:bg-blue-700 text-white px-3 
                                py-1 rounded-md text-sm"
                                    isLoading
                                  >
                                    Please wait...
                                  </Button>
                                ) : (
                                  <Tooltip content="You have sent a friend request to this person.">
                                    <Button
                                      className="bg-blue-500 hover:bg-blue-700 text-white px-3 
                                py-1 rounded-md text-sm dark:bg-blue-700 dark:hover:bg-blue-800"
                                      startContent={<X />}
                                      onPress={handleDeleteFriendRequest}
                                    >
                                      Cancel request
                                    </Button>
                                  </Tooltip>
                                )}
                              </>
                            )}

                          {relationship.status === "pending" &&
                            !relationship.isInitiator && (
                              <div
                                className="relative flex flex-col items-end gap-1"
                                ref={ref}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <div
                                    className="flex items-center md:gap-2 gap-1 px-3 py-3 rounded-lg
            bg-gray-100 text-sm text-black select-none
            cursor-pointer hover:bg-gray-200 transition-all"
                                    onClick={() => setOpen(!open)}
                                  >
                                    <BellRing />

                                    <p>{`You have a friend request from ${viewedUser.profile.first_name} 
                                    ${viewedUser.profile.last_name}.`}</p>
                                  </div>
                                </div>

                                {open && (
                                  <div
                                    className="absolute right-0 z-50 top-full mt-2 bg-white 
                                    dark:bg-black dark:text-white
                                     w-2/3 overflow-hidden flex flex-col gap-1 
                                     transition-opacity duration-150 opacity-100"
                                  >
                                    <Button
                                      onPress={async () =>
                                        await responseToFriendRequest(
                                          ResponseFriendRequestAction.ACCEPT,
                                        )
                                      }
                                      startContent={<Check />}
                                      className="w-full text-white"
                                      color="success"
                                    >
                                      Accept
                                    </Button>

                                    <Button
                                      onPress={async () =>
                                        await responseToFriendRequest(
                                          ResponseFriendRequestAction.REJECT,
                                        )
                                      }
                                      startContent={<X />}
                                      color="danger"
                                    >
                                      Decline
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      )}

                      <Dropdown
                        placement="bottom-end"
                        className="text-black dark:text-white"
                        shouldBlockScroll={false}
                      >
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            className="bg-transparent dark:bg-white/20 rounded-full"
                          >
                            <ChevronDown
                              className="text-gray-700 dark:text-white/80 
                            focus:outline-none"
                            />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="" variant="flat">
                          <DropdownItem
                            key="block"
                            startContent={<UserLock />}
                            onClick={() => blockUserClick(viewedUser)}
                          >
                            Block this user
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  )}
                </div>
              </div>

              {isShowPeopleKnow && <PeopleKnow />}

              <Divider className="dark:bg-white/40" />

              <div className="flex items-center md:gap-3 gap-2 justify-between">
                <div className="flex items-center md:gap-3 gap-2">
                  {headersOptions.map((option, index) => (
                    <div
                      key={option.key}
                      ref={setItemRef(index)}
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => {
                        setActiveIndex(index);
                        updateIndicator(itemsRef.current[index]);
                      }}
                    >
                      <Link
                        href={option.href}
                        className="px-4 py-3 font-medium text-gray-700 dark:text-white/80"
                      >
                        {option.label}
                      </Link>
                    </div>
                  ))}

                  <Dropdown
                    placement="bottom-end"
                    className="text-black dark:text-white"
                    shouldBlockScroll={false}
                  >
                    <DropdownTrigger>
                      <Button
                        endContent={
                          <ChevronDown
                            className="text-gray-700 dark:text-white/80 
                          focus:outline-none"
                          />
                        }
                        className="bg-transparent text-gray-700 dark:text-white/80"
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
                  className="text-black dark:text-white"
                  shouldBlockScroll={false}
                >
                  <DropdownTrigger>
                    <Button isIconOnly className="bg-transparent">
                      <Ellipsis className="text-gray-700 dark:text-white/80 focus:outline-none" />
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

      <ChatBox right={10} />

      <CreateStoryModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default ProfileHeaderSection;
