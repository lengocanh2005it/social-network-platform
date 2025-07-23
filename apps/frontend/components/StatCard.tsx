"use client";
import { Card, CardBody } from "@heroui/react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";
import { Color, colorMap } from "@/utils";

interface StatCardProps {
  title: string;
  value: string;
  percent: string;
  trend: string;
  icon: React.ElementType;
  color: Color;
  sub: string;
}

export function StatCard({
  title,
  value,
  percent,
  trend,
  icon: Icon,
  color,
  sub,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <Card
        className={`bg-white dark:bg-gray-800 border ${colors.border} transition-colors`}
      >
        <CardBody className="p-6">
          <div className="flex justify-between items-start cursor-pointer">
            <div>
              <p className={`text-sm text-${color}-400 font-medium`}>{title}</p>
              <h2 className="text-2xl font-bold mt-1">{value}</h2>
              <div className="flex items-center mt-2 text-sm">
                {trend === "up" ? (
                  <ArrowUp className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-400" />
                )}
                <span
                  className={`ml-1 ${trend === "up" ? "text-green-400" : "text-red-400"}`}
                >
                  {percent}
                </span>
                <span className="text-gray-400 ml-1">{sub}</span>
              </div>
            </div>
            <div
              className={`p-3 rounded-lg bg-${color}-900/50 text-${color}-400`}
            >
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
