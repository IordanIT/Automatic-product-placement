import type { Metadata } from "next";
import { PlanogramPage } from "@/components/planogram/PlanogramPage";

export const metadata: Metadata = { title: "Планограммы" };

export default function Page() {
  return <PlanogramPage />;
}