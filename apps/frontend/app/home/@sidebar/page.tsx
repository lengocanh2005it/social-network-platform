"use client";
import ChatBox from "@/components/chatbox/ChatBox";
import FriendRequests from "@/components/FriendRequests";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { useGetFriendsList } from "@/hooks";
import { useFriendStore, useUserStore } from "@/store";
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
} from "lucide-react";
import { useEffect } from "react";

const SideBarPage: React.FC = () => {
  const { user } = useUserStore();

  const { setFriends, setTotalFriends, friends, openChat } = useFriendStore();

  const { data, isLoading } = useGetFriendsList(user?.id ?? "", {
    username: user?.profile.username ?? "",
  });

  useEffect(() => {
    if (data?.data) setFriends(data.data);
    if (data?.total_friends) setTotalFriends(data.total_friends);
  }, [data, setFriends, setTotalFriends]);

  return (
    <main className="flex flex-col md:gap-1">
      <FriendRequests />

      <Divider className="md:my-3 my-2" />

      <div className="flex flex-col md:gap-2 gap-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-black/70">Contacts</h2>

          <div className="flex items-center md:gap-4 gap-2">
            <SearchIcon size={20} className="cursor-pointer" />

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
          <>
            {friends?.length > 0 ? (
              <>
                <ul className="space-y-3">
                  {friends.map((friend) => (
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

                        <span
                          className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full 
                border-2 border-white"
                        />
                      </div>

                      <span>{friend.full_name}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Empty Users</p>
            )}
          </>
        )}
      </div>

      <ChatBox />
    </main>
  );
};

export default SideBarPage;
