import type { Metadata } from "next";
import { AnalyticsPage } from "@/components/analytics/AnalyticsPage";

export const metadata: Metadata = { title: "Аналитика" };

export default function Page() {
  return <AnalyticsPage />;
}