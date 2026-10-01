export type FacetStatus = "ok" | "oos" | "misplaced" | "facing" | "phantom";

export type Severity = "critical" | "major" | "minor";

export interface Detection {
  id: string;
  sku: string;
  name: string;
  brand: string;
  /** Plate-space coordinates, 0..1 relative to the shelf frame. */
  x: number;
  y: number;
  w: number;
  h: number;
  facing: number;
  expected: number;
  actual: number;
  confidence: number;
  status: FacetStatus;
  aisle: string;
  bay: string;
  level: number;
}

export type TaskType = "oos" | "misplaced" | "facing" | "phantom";
export type TaskStatus = "new" | "assigned" | "in_progress" | "done";

export interface Task {
  id: string;
  type: TaskType;
  severity: Severity;
  store: string;
  aisle: string;
  bay: string;
  level: number;
  sku: string;
  title: string;
  body: string;
  assignee: string | null;
  deadline: string;
  status: TaskStatus;
  createdAt: string;
  confidence: number;
  qty: number;
  photoBefore: string;
}

export interface Store {
  id: string;
  name: string;
  city: string;
  format: string;
  shelves: number;
  osa: number;
  devices: number;
  lastScan: string;
}

export interface Device {
  id: string;
  name: string;
  kind: "camera" | "robot" | "handheld";
  zone: string;
  status: "online" | "offline" | "degraded";
  lastScan: string;
  uptime: number;
  fps: number;
}

export interface CatalogSku {
  sku: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  barcode: string;
  height: number;
  width: number;
  depth: number;
  min: number;
  max: number;
}

export interface PlanogramCell {
  id: string;
  row: number;
  col: number;
  sku: string | null;
  capacity: number;
}