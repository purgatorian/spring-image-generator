"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { GeneratePrint } from "@/components/GeneratePrint";

const componentsMap = {
  "Generate Print": <GeneratePrint />,
  "Generate Clothing": <div>Generate Clothing Content</div>,
  "Generate Models": <div>Generate Models Content</div>,
  "Generate Variant": <div>Generate Variant Content</div>,
  "Fix Image": <div>Fix Image Content</div>,
  Playground: <div>Playground Content</div>,
};

export default function Home() {
  // Manage active component in the state
  const [selectedComponent, setSelectedComponent] = useState("Generate Print");

  const handleSidebarOptionSelect = (option) => {
    setSelectedComponent(option);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <AppSidebar onOptionSelect={handleSidebarOptionSelect} />

      {/* Main content */}
      <div className=" p-8">
        {componentsMap[selectedComponent] || <div>Component not found</div>}
      </div>
    </div>
  );
}
