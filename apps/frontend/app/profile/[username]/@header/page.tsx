"use client";
import EditImageButton from "@/components/button/EditImageButton";
import PeopleKnow from "@/components/PeopleKnow";
import {
  useCreateFriendRequest,
  useDeleteFriendRequest,
  useResponseToFriendRequest,
} from "@/hooks";
import { useAppStore, useUserStore } from "@/store";
import {
  CreateFriendRequestType,
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
  Plus,
  PlusCircle,
  Search,
  Shield,
  UserPlus,
  UserRoundX,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

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
  const { viewedUser, user, relationship, setRelationship } = useUserStore();
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

  useEffect(() => {
    if (itemsRef.current[0]) {
      updateIndicator(itemsRef.current[0]);
      setActiveIndex(0);
    }
  }, []);

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

  return (
    <>
      {viewedUser && (
        <>
          <div className="w-full h-full shadow pb-2 px-2 rounded-b-lg">
            <PhotoProvider>
              <PhotoView src={viewedUser.profile.cover_photo_url}>
                <div
                  className="h-60 w-full bg-gray-300 relative rounded-b-md cursor-pointer"
                  style={{
                    backgroundImage: `url(${viewedUser.profile.cover_photo_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {user?.id === viewedUser?.id && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <EditImageButton type="cover_photo" />
                    </div>
                  )}
                </div>
              </PhotoView>
            </PhotoProvider>

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
                <PhotoProvider>
                  <div className="relative -mt-24">
                    <PhotoView src={viewedUser.profile.avatar_url}>
                      <Image
                        src={viewedUser.profile.avatar_url}
                        alt="Avatar"
                        width={180}
                        height={180}
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="rounded-full border-4 border-white object-cover 
                    select-none cursor-pointer"
                      />
                    </PhotoView>

                    {viewedUser?.id === user?.id && (
                      <EditImageButton type="avatar" />
                    )}
                  </div>
                </PhotoProvider>

                <div className="flex-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center md:gap-2 gap-1">
                      <h1 className="md:text-3xl font-bold text-2xl">
                        {viewedUser.profile.first_name +
                          " " +
                          viewedUser.profile.last_name}
                      </h1>

                      {viewedUser.profile.nickname && (
                        <p className="md:text-lg text-medium text-gray-600">
                          ({viewedUser.profile.nickname})
                        </p>
                      )}
                    </div>

                    <p className="text-gray-600">1000 friends</p>
                  </div>

                  {viewedUser?.id === user?.id ? (
                    <div className="flex gap-2 justify-end items-start">
                      <Button
                        startContent={<Plus className="focus:outline-none" />}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 
                      rounded-md text-sm"
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
                  ) : (
                    <>
                      {relationship && (
                        <div className="flex gap-2 justify-end items-start">
                          {relationship.status === "none" && (
                            <>
                              {isPending ? (
                                <Button
                                  className="bg-blue-500 hover:bg-blue-700 text-white 
                                px-3 py-1 rounded-md text-sm"
                                  isLoading
                                >
                                  Please wait...
                                </Button>
                              ) : (
                                <Button
                                  startContent={<UserPlus />}
                                  className="bg-blue-500 hover:bg-blue-700 text-white 
                                px-3 py-1 rounded-md text-sm"
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
                                <Button
                                  color="primary"
                                  startContent={<UserRoundX />}
                                  onPress={handleDeleteFriend}
                                >
                                  Unfriend
                                </Button>
                              )}
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
                                py-1 rounded-md text-sm"
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
                                    className="absolute right-0 z-50 top-full mt-2 bg-white w-2/3 
            overflow-hidden flex flex-col gap-1 transition-opacity duration-150 opacity-100"
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
                    </>
                  )}
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
