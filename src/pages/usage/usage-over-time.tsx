"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { date: "2023-05-01", usage: 420 },
  { date: "2023-05-02", usage: 380 },
  { date: "2023-05-03", usage: 450 },
  { date: "2023-05-04", usage: 520 },
  { date: "2023-05-05", usage: 480 },
  { date: "2023-05-06", usage: 390 },
  { date: "2023-05-07", usage: 320 },
  { date: "2023-05-08", usage: 410 },
  { date: "2023-05-09", usage: 450 },
  { date: "2023-05-10", usage: 470 },
  { date: "2023-05-11", usage: 490 },
  { date: "2023-05-12", usage: 520 },
  { date: "2023-05-13", usage: 540 },
  { date: "2023-05-14", usage: 490 },
  { date: "2023-05-15", usage: 460 },
  { date: "2023-05-16", usage: 430 },
  { date: "2023-05-17", usage: 410 },
  { date: "2023-05-18", usage: 390 },
  { date: "2023-05-19", usage: 420 },
  { date: "2023-05-20", usage: 450 },
  { date: "2023-05-21", usage: 470 },
  { date: "2023-05-22", usage: 490 },
  { date: "2023-05-23", usage: 510 },
  { date: "2023-05-24", usage: 530 },
  { date: "2023-05-25", usage: 550 },
  { date: "2023-05-26", usage: 570 },
  { date: "2023-05-27", usage: 590 },
  { date: "2023-05-28", usage: 610 },
  { date: "2023-05-29", usage: 630 },
  { date: "2023-05-30", usage: 650 },
];

export function UsageOverTime() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="usage"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorUsage)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
