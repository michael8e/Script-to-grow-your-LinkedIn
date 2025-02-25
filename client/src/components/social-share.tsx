import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Share2, Twitter, Linkedin, Facebook } from "lucide-react";

interface SocialShareProps {
  title: string;
  description: string;
}

export default function SocialShare({ title, description }: SocialShareProps) {
  const shareUrl = window.location.href;
  const text = `${title}\n\n${description}`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2 py-1 h-auto">
          <Share2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(shareLinks.twitter, '_blank')}
            className="px-2 py-1 h-auto hover:text-[#1DA1F2]"
          >
            <Twitter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(shareLinks.linkedin, '_blank')}
            className="px-2 py-1 h-auto hover:text-[#0A66C2]"
          >
            <Linkedin className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(shareLinks.facebook, '_blank')}
            className="px-2 py-1 h-auto hover:text-[#1877F2]"
          >
            <Facebook className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}