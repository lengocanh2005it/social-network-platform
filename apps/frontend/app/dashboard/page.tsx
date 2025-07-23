"use client";
import { ActivityItem } from "@/components/ActivityItem";
import { StatCard } from "@/components/StatCard";
import { UserPostChart } from "@/components/UserPostChart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Color } from "@/utils";
import { Card, CardBody } from "@heroui/react";
import { AlertCircle, FileText, MessageSquare, Users } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Users",
      value: "12,450",
      percent: "12.5%",
      trend: "up",
      icon: Users,
      color: "blue",
      sub: "vs last month",
    },
    {
      title: "Posts Today",
      value: "320",
      percent: "8.3%",
      trend: "up",
      icon: FileText,
      color: "purple",
      sub: "vs yesterday",
    },
    {
      title: "New Comments",
      value: "1,207",
      percent: "3.2%",
      trend: "down",
      icon: MessageSquare,
      color: "green",
      sub: "vs last week",
    },
    {
      title: "Active Reports",
      value: "27",
      percent: "5.1%",
      trend: "up",
      icon: AlertCircle,
      color: "red",
      sub: "needs attention",
    },
  ];

  const activity = [
    {
      user: "John Doe",
      action: "created a new post",
      time: "2 mins ago",
      avatar:
        "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1751373377309-default_user_logo_b1f7pd.png",
    },
    {
      user: "Jane Smith",
      action: "commented on a post",
      time: "15 mins ago",
      avatar:
        "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1751373377309-default_user_logo_b1f7pd.png",
    },
    {
      user: "Admin",
      action: "resolved a report",
      time: "1 hour ago",
      avatar:
        "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1751373377309-default_user_logo_b1f7pd.png",
    },
    {
      user: "Mike Johnson",
      action: "updated profile",
      time: "3 hours ago",
      avatar:
        "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1751373377309-default_user_logo_b1f7pd.png",
    },
    {
      user: "Sarah Williams",
      action: "deleted a comment",
      time: "5 hours ago",
      avatar:
        "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1751373377309-default_user_logo_b1f7pd.png",
    },
  ];

  return (
    <div className="p-6 md:p-10 bg-gray-900 text-gray-100 space-y-10 rounded-xl">
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-100">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, idx) => (
            <StatCard key={idx} {...item} color={item.color as Color} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-100">
          Analytics & Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
          <Card className="bg-gray-800 border border-gray-700 overflow-hidden">
            <CardBody className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-200">
                Growth Overview
              </h3>
              <div className="h-80 overflow-hidden">
                <UserPostChart />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gray-800 border border-gray-700">
            <CardBody className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-200">
                Recent Activities
              </h3>

              <ScrollArea className="max-h-[300px]">
                <div className="flex flex-col md:gap-4 gap-3">
                  {activity.map((item, idx) => (
                    <ActivityItem key={idx} {...item} />
                  ))}
                </div>
              </ScrollArea>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}
