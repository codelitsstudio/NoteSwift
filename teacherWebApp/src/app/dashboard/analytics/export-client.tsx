"use client";

import { ExportCSVButton } from "@/components/ui/export-csv";

export function AttendanceExport({ rows }: { rows: { day: string; count: number }[] }) {
  return (
    <div className="flex justify-end">
      <ExportCSVButton filename="attendance_last_7_days" rows={rows} />
    </div>
  );
}
