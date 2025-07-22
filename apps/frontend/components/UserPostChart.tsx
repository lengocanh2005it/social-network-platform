"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

const sampleData = [
  { name: "Jan", users: 4000, posts: 2400 },
  { name: "Feb", users: 3000, posts: 1398 },
  { name: "Mar", users: 2000, posts: 9800 },
  { name: "Apr", users: 2780, posts: 3908 },
  { name: "May", users: 1890, posts: 4800 },
  { name: "Jun", users: 2390, posts: 3800 },
  { name: "Jul", users: 3490, posts: 4300 },
];

export function UserPostChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const colors = {
    axisColor: isDark ? "#9CA3AF" : "#4B5563",
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={sampleData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.axisColor}
          strokeOpacity={0.3}
        />
        <XAxis
          stroke={colors.axisColor}
          tick={{ fill: colors.axisColor }}
          dataKey="name"
        />
        <YAxis stroke={colors.axisColor} tick={{ fill: colors.axisColor }} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1F2937" : "#fff",
            border: `1px solid ${isDark ? "#4B5563" : "#e5e7eb"}`,
            borderRadius: "0.5rem",
            color: isDark ? "#F3F4F6" : "#111827",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          itemStyle={{
            color: isDark ? "#F3F4F6" : "#374151",
          }}
          labelStyle={{
            color: isDark ? "#D1D5DB" : "#6B7280",
            fontWeight: 500,
          }}
          cursor={{
            fill: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
            radius: 4,
          }}
        />
        <Bar dataKey="users" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="posts" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
