import { FeedbackWithVotes, User, insertCommentSchema } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ChevronUp, ChevronDown, Trash2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import EmojiReactions from "./emoji-reactions";
import SocialShare from "./social-share";

interface FeedbackCardProps {
  feedback: FeedbackWithVotes;
  currentUser: User;
}

export default function FeedbackCard({ feedback, currentUser }: FeedbackCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();

  const voteMutation = useMutation({
    mutationFn: async (isUpvote: number) => {
      await apiRequest("POST", `/api/feedbacks/${feedback.id}/vote`, { isUpvote });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedbacks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/feedbacks/${feedback.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedbacks"] });
      toast({
        title: "Feedback deleted",
        description: "Your feedback has been successfully deleted.",
      });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <h3 className="font-semibold">{feedback.title}</h3>
          <p className="text-sm text-muted-foreground">
            Posted by {feedback.author} on{" "}
            {format(new Date(feedback.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        {feedback.userId === currentUser.id && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <p className="mb-4">{feedback.description}</p>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => voteMutation.mutate(1)}
              disabled={voteMutation.isPending}
              className={feedback.userVote === 1 ? "text-primary" : ""}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <span>{feedback.upvotes}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => voteMutation.mutate(-1)}
              disabled={voteMutation.isPending}
              className={feedback.userVote === -1 ? "text-primary" : ""}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <span>{feedback.downvotes}</span>
          </div>
          <EmojiReactions
            feedbackId={feedback.id}
            reactions={feedback.reactions}
          />
          <SocialShare
            title={feedback.title}
            description={feedback.description}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {feedback.comments.length} Comments
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-4">
            <CommentForm feedbackId={feedback.id} />
            {feedback.comments.map((comment) => (
              <div key={comment.id} className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm">{comment.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(comment.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CommentForm({ feedbackId }: { feedbackId: number }) {
  const form = useForm({
    resolver: zodResolver(insertCommentSchema),
    defaultValues: {
      content: "",
      feedbackId,
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      await apiRequest("POST", `/api/feedbacks/${feedbackId}/comments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedbacks"] });
      form.reset();
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => commentMutation.mutate(data))}
        className="space-y-2"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Add a comment..."
                  className="max-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="sm"
          disabled={commentMutation.isPending}
        >
          Post Comment
        </Button>
      </form>
    </Form>
  );
}