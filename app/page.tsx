"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { GeneratePrint } from "@/components/GeneratePrint";

export default function Home() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main content */}
      <div className="p-8 w-full">
        <GeneratePrint />
      </div>
    </div>
  );
}
