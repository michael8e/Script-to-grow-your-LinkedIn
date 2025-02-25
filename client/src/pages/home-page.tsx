import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FeedbackWithVotes } from "@shared/schema";
import { useState } from "react";
import CreateFeedback from "@/components/create-feedback";
import FeedbackCard from "@/components/feedback-card";
import SearchBar from "@/components/search-bar";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [search, setSearch] = useState("");

  const { data: feedbacks = [], isLoading } = useQuery<FeedbackWithVotes[]>({
    queryKey: ["/api/feedbacks", search],
    queryFn: async ({ signal }) => {
      const url = new URL("/api/feedbacks", window.location.origin);
      if (search) url.searchParams.set("search", search);
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error("Failed to fetch feedbacks");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Feedback Hub</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.username}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <CreateFeedback />
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading feedbacks...
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No feedbacks found.
              </div>
            ) : (
              feedbacks.map((feedback) => (
                <FeedbackCard
                  key={feedback.id}
                  feedback={feedback}
                  currentUser={user!}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
