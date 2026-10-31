import type { Metadata } from "next";
import { OverviewPage } from "@/components/overview/OverviewPage";

export const metadata: Metadata = { title: "Обзор" };

export default function Page() {
  return <OverviewPage />;
}