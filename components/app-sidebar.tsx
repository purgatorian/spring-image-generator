"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Sidebar,
  useSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/dark-mode";
import {
  ClerkProvider,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import {
  Paintbrush,
  Shirt,
  PersonStanding,
  SquarePen,
  Sparkles,
  Wrench,
} from "lucide-react";

const items = [
  {
    title: "Generate Print",
    icon: Paintbrush,
    description:
      "Use AI-powered tools to generate garment print designs. Supports both image-to-image and text-to-image generation for creative outputs.",
  },
  {
    title: "Generate Clothing",
    icon: Shirt,
    description:
      "Visualize how a print design will look on a garment. Upload or select a blank garment and overlay it with print designs.",
  },
  {
    title: "Generate Models",
    icon: PersonStanding,
    description:
      "Showcase garments in real-life settings with AI-generated models wearing the printed garments.",
  },
  {
    title: "Fix Image",
    icon: Sparkles,
    description:
      "Enhance images by adjusting lighting, fixing shadows, and removing unnecessary background items for a clean look.",
  },
  {
    title: "Playground",
    icon: Wrench,
    description:
      "Experiment with text-to-image AI models that can generate images based on any creative prompt.",
  },
];

export function AppSidebar({ onOptionSelect }) {
  const {
    state,
    setOpen,
    isMobile,
  } = useSidebar();
  const [activeComponent, setActiveComponent] = useState("Generate Print");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className={
                state == "collapsed"
                  ? "flex w-full justify-between flex-col"
                  : "flex w-full justify-between flex-row"
              }
            >
              <Image
                className="mb-5"
                src="/mobile-icon.png"
                width={50}
                height={50}
                alt="Spring"
                text="Spring"
              />
              <div>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <SidebarMenuButton
                        asChild
                        onClick={() => onOptionSelect(item.title)}
                      >
                        <button className="flex items-center gap-2">
                          <item.icon className="w-5 h-5" />
                          {state !== "collapsed" && <span>{item.title}</span>}
                        </button>
                      </SidebarMenuButton>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </HoverCardContent>
                  </HoverCard>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-center p-5">
          <ModeToggle hideIcons={state === "collapsed"} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
