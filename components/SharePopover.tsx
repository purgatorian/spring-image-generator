// components/SharePopover.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Share2, Link, Mail, Twitter, Instagram, MessageCircle, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SharePopoverProps {
  imageUrl: string;
}

const SharePopover: React.FC<SharePopoverProps> = ({ imageUrl }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast({
        title: "Link Copied!",
        description: "The image link has been copied to your clipboard.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error!",
        description: "Failed to copy the link.",
        variant: "destructive",
      });
    }
  };

  const shareOptions = [
    {
      label: "Copy Link",
      icon: <Link className="w-5 h-5" />,
      action: handleCopyLink,
    },
    {
      label: "Email",
      icon: <Mail className="w-5 h-5" />,
      action: () => window.open(`mailto:?subject=Check this image&body=${imageUrl}`),
    },
    {
      label: "X",
      icon: <Twitter className="w-5 h-5" />,
      action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(imageUrl)}`),
    },
    {
      label: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5" />,
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(imageUrl)}`),
    },
    {
      label: "Instagram",
      icon: <Instagram className="w-5 h-5" />,
      action: () => window.open("https://www.instagram.com/", "_blank"),
    },
    {
      label: "Facebook",
      icon: <Facebook className="w-5 h-5" />,
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}`),
    },
  ];

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="bg-gray-200 dark:bg-gray-800 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700">
          <Share2 className="w-6 h-6 text-black dark:text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex space-x-4 p-4 w-[400px] max-w-full">
        {shareOptions.map(({ label, icon, action }) => (
          <div key={label} className="flex flex-col items-center space-y-1">
            <Button
              onClick={action}
              variant="ghost"
              className="flex items-center justify-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {icon}
            </Button>
            <span className="text-xs text-gray-600 dark:text-gray-300 mt-1">{label}</span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default SharePopover;
