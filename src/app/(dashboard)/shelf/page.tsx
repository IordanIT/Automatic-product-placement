import type { Metadata } from "next";
import { ShelfAnalysisPage } from "@/components/shelf/ShelfAnalysisPage";

export const metadata: Metadata = { title: "Анализ полки" };

export default function Page() {
  return <ShelfAnalysisPage />;
}