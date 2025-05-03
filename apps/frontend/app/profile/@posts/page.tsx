import CreatePost from "@/components/post/CreatePost";
import ProfilePosts from "@/components/post/ProfilePosts";
import { Post } from "@/utils";

const posts: Post[] = [
  {
    id: 1,
    author: "John Doe",
    content: "The weather is beautiful today! ☀️",
    time: "2 hours ago",
    avatar:
      "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    image:
      "https://i.pinimg.com/736x/fc/d1/50/fcd15099c68fa9895e151ad2ec141f30.jpg",
  },
  {
    id: 2,
    author: "John Doe",
    content: "Just had some pho, it was amazing 😋",
    time: "4 hours ago",
    avatar:
      "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    image:
      "https://i.pinimg.com/736x/fc/d1/50/fcd15099c68fa9895e151ad2ec141f30.jpg",
  },
  {
    id: 3,
    author: "John Doe",
    content: "Anyone up for coffee this afternoon? ☕️",
    time: "1 day ago",
    avatar:
      "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    image:
      "https://i.pinimg.com/736x/fc/d1/50/fcd15099c68fa9895e151ad2ec141f30.jpg",
  },
  {
    id: 4,
    author: "John Doe",
    content: "I totally agree with this!",
    time: "1 hour ago",
    avatar:
      "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    isShared: true,
    originalPost: {
      author: "Jane Smith",
      content: "Sunset at the beach today 🌅",
      time: "5 hours ago",
      avatar:
        "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
      image:
        "https://i.pinimg.com/736x/fc/d1/50/fcd15099c68fa9895e151ad2ec141f30.jpg",
    },
  },
];

const ProfilePostsSection = () => {
  return (
    <section className="flex flex-col md:gap-3 gap-2">
      <CreatePost />

      <div className="flex flex-col">
        {posts.map((p) => (
          <ProfilePosts post={p} key={p.id} />
        ))}
      </div>
    </section>
  );
};

export default ProfilePostsSection;
