import HomeNav from "@/components/nav/HomeNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex w-full flex-col md:gap-4 gap-3 min-h-screen text-black scroll-smooth">
      <HomeNav />

      {children}
    </main>
  );
}
