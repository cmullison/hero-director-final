"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
const data = [
  { name: "Jan 1", Chat: 400, Image: 240, Code: 320, Video: 180 },
  { name: "Jan 5", Chat: 430, Image: 300, Code: 310, Video: 220 },
  { name: "Jan 10", Chat: 500, Image: 320, Code: 340, Video: 250 },
  { name: "Jan 15", Chat: 580, Image: 350, Code: 380, Video: 300 },
  { name: "Jan 20", Chat: 600, Image: 380, Code: 430, Video: 320 },
  { name: "Jan 25", Chat: 650, Image: 400, Code: 450, Video: 350 },
  { name: "Jan 30", Chat: 700, Image: 450, Code: 470, Video: 380 },
];

export function AnalyticsChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="Chat"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="Image"
          stroke="#82ca9d"
          strokeWidth={2}
        />
        <Line type="monotone" dataKey="Code" stroke="#ffc658" strokeWidth={2} />
        <Line
          type="monotone"
          dataKey="Video"
          stroke="#ff8042"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
