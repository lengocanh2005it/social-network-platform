"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { useGetGrowthOverview } from "@/hooks";
import { useUserStore } from "@/store";
import { GrowthOverviewType } from "@/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function UserPostChart() {
  const { user } = useUserStore();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [growthData, setGrowthData] = useState<GrowthOverviewType[]>([]);
  const { data, isLoading, isFetching } = useGetGrowthOverview(user?.id ?? "");

  const colors = {
    axisColor: isDark ? "#9CA3AF" : "#4B5563",
  };

  useEffect(() => {
    if (data) {
      setGrowthData(data);
    }
  }, [data, setGrowthData]);

  return (
    <>
      {isLoading || isFetching ? (
        <div className="h-full w-full flex items-center justify-center">
          <PrimaryLoading />
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={growthData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.axisColor}
                strokeOpacity={0.3}
              />
              <XAxis
                stroke={colors.axisColor}
                dataKey="name"
                interval={0}
                tick={({ x, y, payload }) => {
                  const [month, year] = payload.value.split("-");
                  return (
                    <g transform={`translate(${x},${y + 10})`}>
                      <text
                        textAnchor="middle"
                        fontSize={12}
                        fill={colors.axisColor}
                      >
                        <tspan x={0} dy="0">
                          {month}
                        </tspan>
                        {year && (
                          <tspan x={0} dy="1.2em">
                            {year}
                          </tspan>
                        )}
                      </text>
                    </g>
                  );
                }}
              />
              <YAxis
                stroke={colors.axisColor}
                tick={{ fill: colors.axisColor }}
              />
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
                  fill: isDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.03)",
                  radius: 4,
                }}
              />
              <Bar dataKey="users" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="posts" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </>
  );
}
