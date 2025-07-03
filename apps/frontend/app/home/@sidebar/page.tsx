"use client";
import FriendRequests from "@/components/FriendRequests";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { useGetFriendsList, useSocket } from "@/hooks";
import { useFriendStore, useUserStore } from "@/store";
import { FriendListType, SocketNamespace } from "@/utils";
import {
  Avatar,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  CircleX,
  Ellipsis,
  MessageSquareWarning,
  SearchIcon,
  Users,
} from "lucide-react";
import { useEffect } from "react";

const SideBarPage: React.FC = () => {
  const { user } = useUserStore();

  const {
    setFriends,
    setTotalFriends,
    friends,
    openChat,
    clearOpenChats,
    updateOnlineStatus,
  } = useFriendStore();
  const { on, off, emit } = useSocket(SocketNamespace.PRESENCE);

  useEffect(() => {
    const handleOnlineFriends = (friendIds: string[]) =>
      updateOnlineStatus(friendIds);

    const handleFriendOnline = ({ user_id }: { user_id: string }) => {
      const updated = friends.map((friend) =>
        friend.user_id === user_id ? { ...friend, is_online: true } : friend
      );
      setFriends(updated);
    };

    const handleFriendOffline = ({ user_id }: { user_id: string }) => {
      const updated = friends.map((friend) =>
        friend.user_id === user_id ? { ...friend, is_online: false } : friend
      );
      setFriends(updated);
    };

    on("online-friends", handleOnlineFriends);
    on("friend-online", handleFriendOnline);
    on("friend-offline", handleFriendOffline);

    emit("get-online-friends");

    return () => {
      off("online-friends", handleOnlineFriends);
      off("friend-online", handleFriendOnline);
      off("friend-offline", handleFriendOffline);
    };
  }, [on, off, emit, friends, setFriends, updateOnlineStatus]);

  const { data, isLoading } = useGetFriendsList(user?.id ?? "", {
    username: user?.profile.username ?? "",
    type: FriendListType.FRIENDS,
  });

  useEffect(() => {
    if (data?.data) setFriends(data.data);
    if (data?.total_friends) setTotalFriends(data.total_friends);

    return () => clearOpenChats();
  }, [data, setFriends, setTotalFriends, clearOpenChats]);

  return (
    <main className="flex flex-col md:gap-1 flex-1 h-full">
      <FriendRequests />

      <Divider className="md:my-3 my-2" />

      <div className="flex flex-col md:gap-2 gap-1 h-full">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-black/70">Contacts</h2>

          <div className="flex items-center md:gap-4 gap-2">
            {friends?.length !== 0 && (
              <SearchIcon size={20} className="cursor-pointer" />
            )}

            <Dropdown
              placement="bottom-end"
              className="text-black"
              shouldBlockScroll={false}
            >
              <DropdownTrigger>
                <Ellipsis
                  size={30}
                  className="cursor-pointer focus:outline-none"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="test-1" startContent={<CircleX />}>
                  Hide post
                </DropdownItem>

                <DropdownItem
                  key="test-2"
                  startContent={<MessageSquareWarning />}
                >
                  Test 1
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {isLoading ? (
          <PrimaryLoading />
        ) : (
          <div className="h-full relative flex-1 flex flex-col">
            {friends?.length > 0 ? (
              <>
                <ul className="space-y-3">
                  {friends
                    .slice()
                    .sort((a, b) => {
                      if (a.is_online === b.is_online) return 0;
                      return a.is_online ? -1 : 1;
                    })
                    .map((friend) => (
                      <li
                        key={friend.user_id}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 
                      p-2 rounded-sm"
                        onClick={() => openChat(friend)}
                      >
                        <div className="relative">
                          <Avatar
                            src={friend.avatar_url}
                            alt={friend.full_name}
                            className="select-none cursor-pointer object-cover"
                          />

                          {friend.is_online && (
                            <span
                              className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full 
              border-2 border-white"
                            />
                          )}
                        </div>

                        <span>{friend.full_name}</span>
                      </li>
                    ))}
                </ul>
              </>
            ) : (
              <div
                className="flex flex-col items-center text-center justify-center 
              flex-1 space-y-2"
              >
                <Users className="w-10 h-10 text-gray-400" />
                <h1 className="text-xl font-semibold">No Friends</h1>
                <p className="text-sm text-gray-500">
                  Add some friends to get started!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default SideBarPage;
