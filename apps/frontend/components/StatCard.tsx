"use client";
import { colorMap, StatsType } from "@/utils";
import { Card, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  stats: StatsType;
}

export function StatCard({ stats }: StatCardProps) {
  const colors = colorMap[stats.color];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <Card
        className={`bg-white dark:bg-gray-800 border ${colors.border} transition-colors cursor-pointer`}
      >
        <CardBody className="p-6">
          <div className="flex flex-col justify-between items-start">
            <div className="flex items-center justify-between flex-1 w-full">
              <div>
                <p className={`text-sm text-${stats.color}-400 font-medium`}>
                  {stats.title}
                </p>
                <h2 className="text-2xl font-bold mt-1">{stats.value}</h2>
              </div>

              <div
                className={`p-3 rounded-lg bg-${stats.color}-900/50 text-${stats.color}-400`}
              >
                <stats.icon className="h-6 w-6" />
              </div>
            </div>

            <div className="flex items-center mt-2 text-sm">
              {stats.trend === "up" ? (
                <ArrowUp className="h-4 w-4 text-green-400" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-400" />
              )}
              <span
                className={`ml-1 ${stats.trend === "up" ? "text-green-400" : "text-red-400"}`}
              >
                {stats.percent}
              </span>
              <span className="text-gray-400 ml-1 text-nowrap">
                {stats.sub}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
