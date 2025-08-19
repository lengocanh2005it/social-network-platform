"use client";
import FriendRequests from "@/components/FriendRequests";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { useFingerprint, useGetFriendsList, useSocket } from "@/hooks";
import { getFriendsList } from "@/lib/api/users";
import { useFriendStore, useUserStore } from "@/store";
import { FriendListType, handleAxiosError, SocketNamespace } from "@/utils";
import { Avatar, Divider } from "@heroui/react";
import { Ellipsis, SearchIcon, Users } from "lucide-react";
import { useEffect, useState } from "react";

const SideBarPage: React.FC = () => {
  const { user } = useUserStore();
  const fingerprint = useFingerprint();
  const {
    setFriends,
    setTotalFriends,
    friends,
    openChat,
    clearOpenChats,
    updateOnlineStatus,
    addFriends,
  } = useFriendStore();
  const { on, off, emit } = useSocket(
    SocketNamespace.PRESENCE,
    fingerprint ?? "",
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isHasMore, setIsHasMore] = useState<boolean>(false);

  useEffect(() => {
    const handleOnlineFriends = (friendIds: string[]) =>
      updateOnlineStatus(friendIds);

    const handleFriendOnline = ({ user_id }: { user_id: string }) => {
      const updated = friends.map((friend) =>
        friend.user_id === user_id ? { ...friend, is_online: true } : friend,
      );
      setFriends(updated);
    };

    const handleFriendOffline = ({ user_id }: { user_id: string }) => {
      const updated = friends.map((friend) =>
        friend.user_id === user_id ? { ...friend, is_online: false } : friend,
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

  const loadMore = async () => {
    if (isHasMore || !nextCursor || !user?.profile?.username) return;
    try {
      setIsHasMore(true);
      const res = await getFriendsList({
        username: user.profile.username,
        type: FriendListType.FRIENDS,
        after: nextCursor,
      });
      addFriends(res?.data ?? []);
      setNextCursor(res?.nextCursor ?? null);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsHasMore(false);
    }
  };

  useEffect(() => {
    if (data?.data) setFriends(data.data);
    if (data?.total_friends) setTotalFriends(data.total_friends);
    setNextCursor(data?.nextCursor ?? null);
    return () => clearOpenChats();
  }, [data, setFriends, setTotalFriends, clearOpenChats, setNextCursor]);

  return (
    <main
      className="flex flex-col md:gap-1 flex-1 overflow-y-auto h-full pr-2 pt-6"
      onScroll={(e) => {
        const target = e.currentTarget;
        if (
          target.scrollTop + target.clientHeight >= target.scrollHeight - 20 &&
          nextCursor
        ) {
          loadMore();
        }
      }}
    >
      <FriendRequests />

      <Divider className="md:my-3 my-2 dark:bg-white/30" />

      <div className="flex flex-col md:gap-2 gap-1 h-full">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-black/70 dark:text-white/70">
            Contacts
          </h2>

          <div className="flex items-center md:gap-4 gap-2">
            {friends?.length !== 0 && (
              <SearchIcon size={20} className="cursor-pointer" />
            )}

            <Ellipsis size={30} className="cursor-pointer focus:outline-none" />
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
                      p-2 rounded-sm dark:hover:bg-white/20"
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

                {isHasMore && <PrimaryLoading />}
              </>
            ) : (
              <div
                className="flex flex-col items-center text-center justify-center 
              flex-1 space-y-2"
              >
                <Users className="w-10 h-10 text-gray-400" />
                <h1 className="text-xl font-semibold">No Friends</h1>
                <p className="text-sm text-gray-500 dark:text-white/80">
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
