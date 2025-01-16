"use client";

import { GeneratePrint } from "@/components/GeneratePrint";

export default function Home() {
  return (
    <div className="flex">
      <div className="p-8 w-full">
        <GeneratePrint />
      </div>
    </div>
  );
}
