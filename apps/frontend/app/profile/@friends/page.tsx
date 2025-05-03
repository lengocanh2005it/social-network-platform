import FriendsList from "@/components/FriendsList";
import { FriendType } from "@/utils";
import Link from "next/link";

const friends: FriendType[] = [
  {
    id: "1",
    avatar:
      "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "John Doe",
  },
  {
    id: "2",
    avatar:
      "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "Jane Doe",
  },
  {
    id: "3",
    avatar:
      "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "Luke Coleman",
  },
  {
    id: "4",
    avatar:
      "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "Luke Coleman",
  },
  {
    id: "5",
    avatar:
      "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "Michale Jackson",
  },
  {
    id: "6",
    avatar:
      "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "Lisa Jackson",
  },
];

const ProfileFriendSection = () => {
  return (
    <section className="w-full flex flex-col md:gap-2 gap-1">
      <div className="flex items-center justify-between">
        <h1 className="font-medium md:text-xl text-lg">Friends</h1>

        <Link href={"/"} className="text-blue-700 hover:underline">
          See all friends
        </Link>
      </div>

      <p>88 friends</p>

      <FriendsList friends={friends} />
    </section>
  );
};

export default ProfileFriendSection;
