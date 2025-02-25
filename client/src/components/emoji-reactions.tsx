import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const AVAILABLE_EMOJIS = ["👍", "❤️", "😄", "🎉", "🙏", "💡", "🔥"];

interface EmojiReactionsProps {
  feedbackId: number;
  reactions: {
    emoji: string;
    count: number;
    userReacted: boolean;
  }[];
}

export default function EmojiReactions({ feedbackId, reactions }: EmojiReactionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const addReactionMutation = useMutation({
    mutationFn: async (emoji: string) => {
      await apiRequest("POST", `/api/feedbacks/${feedbackId}/reactions`, { emoji });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedbacks"] });
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: async (emoji: string) => {
      await apiRequest("DELETE", `/api/feedbacks/${feedbackId}/reactions/${emoji}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedbacks"] });
    },
  });

  const handleReaction = (emoji: string) => {
    const existingReaction = reactions.find((r) => r.emoji === emoji && r.userReacted);
    if (existingReaction) {
      removeReactionMutation.mutate(emoji);
    } else {
      addReactionMutation.mutate(emoji);
    }
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {reactions.map(
        (reaction) =>
          reaction.count > 0 && (
            <Button
              key={reaction.emoji}
              variant={reaction.userReacted ? "default" : "ghost"}
              size="sm"
              onClick={() => handleReaction(reaction.emoji)}
              className="px-2 py-1 h-auto text-sm"
            >
              {reaction.emoji} {reaction.count}
            </Button>
          )
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="px-2 py-1 h-auto">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex gap-1">
            {AVAILABLE_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(emoji)}
                className="px-2 py-1 h-auto text-lg hover:bg-muted"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
