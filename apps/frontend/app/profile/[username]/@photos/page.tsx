import ProfilePhotos from "@/components/ProfilePhotos";
import Link from "next/link";

const images = [
  "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
  "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
  "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
  "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
  "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
  "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
  "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
  "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
  "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
  "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
  "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
  "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
];

const ProfilePhotosSection = () => {
  return (
    <section className="w-full flex flex-col md:gap-2 gap-1">
      <div className="flex items-center justify-between">
        <h1 className="font-medium md:text-xl text-lg">Photos</h1>

        <Link href={"/"} className="text-blue-700 hover:underline">
          See all photos
        </Link>
      </div>

      <ProfilePhotos images={images} />
    </section>
  );
};

export default ProfilePhotosSection;
