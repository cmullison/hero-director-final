"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  {
    name: "GPT-4o",
    "Response Time (ms)": 850,
    "Accuracy (%)": 98,
  },
  {
    name: "Claude 3",
    "Response Time (ms)": 920,
    "Accuracy (%)": 97,
  },
  {
    name: "Gemini",
    "Response Time (ms)": 780,
    "Accuracy (%)": 95,
  },
  {
    name: "Llama 3",
    "Response Time (ms)": 1050,
    "Accuracy (%)": 94,
  },
  {
    name: "Mistral",
    "Response Time (ms)": 980,
    "Accuracy (%)": 93,
  },
];

export function ModelComparisonChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="Response Time (ms)" fill="#8884d8" />
        <Bar yAxisId="right" dataKey="Accuracy (%)" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}
