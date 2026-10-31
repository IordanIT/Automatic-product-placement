import type { Metadata } from "next";
import { TasksPage } from "@/components/tasks/TasksPage";

export const metadata: Metadata = { title: "Задачи" };

export default function Page() {
  return <TasksPage />;
}