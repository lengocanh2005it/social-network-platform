"use client";
import AdminProfileModal from "@/components/modal/AdminProfileModal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  ChartArea,
  ChevronRight,
  FileText,
  Inbox,
  MessageCircleIcon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: ChartArea, label: "Dashboard" },
  { href: "/dashboard/users", icon: Users, label: "Users" },
  { href: "/dashboard/posts", icon: FileText, label: "Posts" },
  { href: "/dashboard/stories", icon: BookOpen, label: "Stories" },
  {
    href: "/dashboard/messages",
    icon: MessageCircleIcon,
    label: "Messages",
  },
  { href: "/dashboard/reports", icon: AlertCircle, label: "Reports" },
  { href: "/dashboard/support", icon: Inbox, label: "Supports" },
];

export function SideBar() {
  const pathname = usePathname();

  function getActiveHref(pathname: string, hrefs: string[]) {
    const sorted = [...hrefs].sort((a, b) => b.length - a.length);
    return sorted.find(
      (href) => pathname === href || pathname.startsWith(href + "/"),
    );
  }

  return (
    <aside
      className="fixed md:static z-40 top-0 left-0 h-full w-64 bg-gradient-to-b 
    from-white to-gray-50 dark:from-gray-900 dark:to-black border-r 
    dark:border-gray-800 shadow-lg flex flex-col justify-between pb-6 px-2"
    >
      <div className="relative flex flex-col md:gap-4 gap-2 p-4">
        <div className="pb-4">
          <motion.h2
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 
          to-blue-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Dashboard
          </motion.h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Powerful tools to manage your platform
          </p>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const activeHref = getActiveHref(
              pathname,
              navItems.map((item) => item.href),
            );

            const isActive = href === activeHref;

            return (
              <motion.div
                key={href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={href}
                  className={cn(
                    "flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 text-purple-700 dark:text-purple-300 shadow-sm"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        isActive
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
                      )}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="font-medium">{label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <ChevronRight
                        size={16}
                        className="text-purple-600 dark:text-purple-400"
                      />
                    </motion.div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      <AdminProfileModal />
    </aside>
  );
}
