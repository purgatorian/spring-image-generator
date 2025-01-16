"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";

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
import { SignedIn, UserButton } from "@clerk/nextjs";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import {
  Paintbrush,
  Shirt,
  PersonStanding,
  Sparkles,
  Wrench,
  FolderOpen,
  BookOpen,
} from "lucide-react";
import Link from "next/link";


const items = [
  {
    title: "Generate Print",
    icon: Paintbrush,
    href: "/",
    description: "Use AI-powered tools to generate garment print designs.",
  },
  {
    title: "Generate Clothing",
    icon: Shirt,
    href: "/generate-clothing",
    description: "Visualize how a print design will look on a garment.",
  },
  {
    title: "Generate Models",
    icon: PersonStanding,
    href: "/generate-models",
    description: "Showcase garments in real-life settings.",
  },
  {
    title: "Fix Image",
    icon: Wrench,
    href: "/fix-image",
    description: "Enhance images by adjusting lighting and shadows.",
  },
  {
    title: "Playground",
    icon: Sparkles,
    href: "/playground",
    description: "Experiment with AI image generation.",
  },
];

const userItems = [
  {
    title: "My Requests",
    icon: FolderOpen,
    href: "/requests",
    description: "View your past generation requests.",
  },
  {
    title: "My Collections",
    icon: BookOpen,
    href: "/collections",
    description: "Browse your saved image collections.",
  },
];

export function AppSidebar({ }) {
  const { state  } = useSidebar();
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={
              state == "collapsed"
                ? "flex w-full justify-between flex-col"
                : "flex w-full justify-between flex-row"
            }>
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
          <SidebarGroupLabel>AI Generation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className={`${pathname === item.href ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        <div
                          className={`flex items-center gap-2 px-2 py-1 rounded`}
                        >
                          <item.icon className="w-5 h-5" />
                          {state !== "collapsed" && <span>{item.title}</span>}
                        </div>
                      </Link>
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

        <SidebarGroup>
          <SidebarGroupLabel>My Data</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.title} className={`${pathname === item.href ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <SidebarMenuButton asChild>
                      <Link href={item.href}>
  <div
    className={`flex items-center gap-2 px-2 py-1 rounded`}
  >
    <item.icon className="w-5 h-5" />
    {state !== "collapsed" && <span>{item.title}</span>}
  </div>
</Link>
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
