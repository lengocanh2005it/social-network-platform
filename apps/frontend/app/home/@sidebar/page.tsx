"use client";
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ScrollShadow,
  Tooltip,
  User,
} from "@heroui/react";
import {
  CircleX,
  Ellipsis,
  MessageSquareWarning,
  SearchIcon,
} from "lucide-react";

const onlineFriends = [
  { name: "Alice Nguyen", avatar: "https://i.pravatar.cc/40?u=alice" },
  { name: "Michael Tran", avatar: "https://i.pravatar.cc/40?u=michael" },
  { name: "David Do", avatar: "https://i.pravatar.cc/40?u=david" },
  { name: "Sarah Lee", avatar: "https://i.pravatar.cc/40?u=sarah" },
  { name: "Emily Johnson", avatar: "https://i.pravatar.cc/40?u=emily" },
  { name: "Daniel Kim", avatar: "https://i.pravatar.cc/40?u=daniel" },
  { name: "Sophia White", avatar: "https://i.pravatar.cc/40?u=sophia" },
  { name: "James Smith", avatar: "https://i.pravatar.cc/40?u=james" },
  { name: "Olivia Brown", avatar: "https://i.pravatar.cc/40?u=olivia" },
  { name: "William Taylor", avatar: "https://i.pravatar.cc/40?u=william" },
  { name: "Isabella Davis", avatar: "https://i.pravatar.cc/40?u=isabella" },
  { name: "Ethan Moore", avatar: "https://i.pravatar.cc/40?u=ethan" },
  { name: "Mia Clark", avatar: "https://i.pravatar.cc/40?u=mia" },
  { name: "Logan Lewis", avatar: "https://i.pravatar.cc/40?u=logan" },
  { name: "Grace Hall", avatar: "https://i.pravatar.cc/40?u=grace" },
  { name: "Lucas Allen", avatar: "https://i.pravatar.cc/40?u=lucas" },
  { name: "Ava Young", avatar: "https://i.pravatar.cc/40?u=ava" },
  { name: "Chloe King", avatar: "https://i.pravatar.cc/40?u=chloe" },
];

const friendRequests = [
  {
    id: 1,
    name: "John Smith",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: 2,
    name: "Emma Johnson",
    avatar: "https://i.pravatar.cc/40?img=2",
  },
  {
    id: 3,
    name: "Michael Brown",
    avatar: "https://i.pravatar.cc/40?img=3",
  },
  {
    id: 4,
    name: "Michael Brown",
    avatar: "https://i.pravatar.cc/40?img=3",
  },
];

const SideBarPage = () => {
  return (
    <main className="flex flex-col md:gap-1">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium text-black/70">Friend Requests</h2>

        <ul>
          <ScrollShadow
            className="max-h-[200px]"
            hideScrollBar
            offset={0}
            size={0}
          >
            {friendRequests.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between hover:bg-gray-100 p-2 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Tooltip content={user.name} delay={3000}>
                    <User
                      avatarProps={{
                        src: user.avatar,
                      }}
                      name={
                        <span className="block max-w-[100px] truncate text-sm font-medium">
                          {user.name}
                        </span>
                      }
                      className="cursor-pointer select-none"
                    />
                  </Tooltip>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="bg-blue-500 text-white text-sm px-3 py-1 rounded 
                  hover:bg-blue-700 transition"
                  >
                    Confirm
                  </Button>

                  <Button
                    className="bg-gray-200 text-sm px-3 py-1 rounded 
                  hover:bg-gray-300 transition"
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ScrollShadow>
        </ul>
      </div>

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

        <ul className="space-y-3">
          {onlineFriends.map((friend, index) => (
            <li
              key={index}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
            >
              <div className="relative">
                <Avatar
                  src={friend.avatar}
                  alt={friend.name}
                  className="select-none cursor-pointer object-cover"
                />

                <span
                  className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full 
                border-2 border-white"
                />
              </div>

              <span>{friend.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default SideBarPage;
