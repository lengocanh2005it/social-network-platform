"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { useGetBlockedUsersList, useUnblockUser } from "@/hooks";
import { getBlockedUsersList } from "@/lib/api/users";
import { useUserStore } from "@/store";
import { BlockedUserType, formatDateTime, handleAxiosError } from "@/utils";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ScrollShadow,
} from "@heroui/react";
import { Ban, Ellipsis, UserMinus } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const BlockedUsersList: React.FC = () => {
  const { user } = useUserStore();
  const { data, isLoading } = useGetBlockedUsersList(user?.id ?? "");
  const [blockedUsersList, setBlockedUsersList] = useState<BlockedUserType[]>(
    [],
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadMore, setLoadMore] = useState<boolean>(false);
  const { mutate: mutateUnblockUser } = useUnblockUser();

  useEffect(() => {
    if (data && data?.data) {
      setBlockedUsersList(data?.data);
    }

    setNextCursor(data?.nextCursor ? data.nextCursor : null);
  }, [data, setBlockedUsersList, setNextCursor]);

  const hanleLoadMore = async () => {
    if (!nextCursor || loadMore) return;

    setLoadMore(true);

    try {
      const data = await getBlockedUsersList({
        after: nextCursor,
      });

      if (data?.data) setBlockedUsersList((prev) => [...prev, ...data?.data]);

      setNextCursor(data?.nextCursor ? data.nextCursor : null);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoadMore(false);
    }
  };

  const handleUnblockUserClick = (targetId: string) => {
    mutateUnblockUser(targetId, {
      onSuccess: (data: Record<string, string | boolean>) => {
        if (data && data?.message && typeof data.message === "string") {
          toast.success(data.message, {
            position: "bottom-right",
          });
          setBlockedUsersList((prev) =>
            prev.filter((i) => i.user_id !== targetId),
          );
        }
      },
    });
  };

  if (isLoading) return <PrimaryLoading />;

  return (
    <section className="relative md:w-[90%] w-full h-full mx-auto flex flex-col">
      {blockedUsersList?.length > 0 ? (
        <div className="flex flex-col md:gap-3 gap-2 shadow rounded-lg p-4">
          <ScrollShadow
            className="max-h-[300px] flex flex-col md:gap-3 gap-2"
            offset={0}
            size={0}
            hideScrollBar
          >
            {blockedUsersList.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center justify-center md:gap-3 gap-2">
                  <Avatar
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-13 h-13 select-none rounded-full flex-shrink-0"
                  />

                  <div className="flex flex-col relative gap-1">
                    <h1 className="text-sm text-black">{user.full_name}</h1>

                    <div className="flex flex-col items-start justify-start text-gray-600">
                      <p className="text-xs">Blocked at: </p>

                      <p className="text-xs text-gray-700">
                        {formatDateTime(user.blocked_at)}
                      </p>
                    </div>
                  </div>
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
                    <DropdownItem
                      key="view-as"
                      startContent={<UserMinus />}
                      onClick={() => handleUnblockUserClick(user.user_id)}
                    >
                      Unblock
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            ))}
          </ScrollShadow>

          {nextCursor && (
            <p
              className="text-right cursor-pointer hover:underline hover:text-blue-600"
              onClick={hanleLoadMore}
            >
              View more
            </p>
          )}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center text-center 
        py-10 text-muted-foreground shadow rounded-lg md:gap-2 gap-1"
        >
          <Ban className="w-12 h-12" />

          <div className="flex flex-col md:gap-1">
            <h1 className="text-xl font-semibold">No Blocked Users</h1>
            <p className="text-sm">You haven&apos;t blocked anyone yet.</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default BlockedUsersList;
