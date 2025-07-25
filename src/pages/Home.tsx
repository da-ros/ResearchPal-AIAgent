import { Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { useNavigate } from "react-router-dom";

const recentSearches = [
  { id: 1, topic: "Prompt Engineering", count: 12 },
  { id: 2, topic: "Neural Networks", count: 24 },
  { id: 3, topic: "Computer Vision", count: 8 },
  { id: 4, topic: "NLP Applications", count: 15 },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <AppLayout headerTitle="ResearchPal">
      <div className="p-4 space-y-6">
        {/* Quick Search Button */}
        <Button 
          onClick={() => navigate("/search")}
          className="w-full h-14 text-left justify-start gap-3 bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-200"
          size="lg"
        >
          <Search className="h-5 w-5" />
          <span className="text-base">Ask the Assistant About Research...</span>
        </Button>

        {/* Recent Searches */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Searches</h2>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {recentSearches.map((search) => (
              <Card 
                key={search.id}
                className="flex-shrink-0 p-4 w-36 cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-paper-card-hover"
                onClick={() => navigate(`/search?q=${encodeURIComponent(search.topic)}`)}
              >
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-foreground line-clamp-2">
                    {search.topic}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {search.count} papers
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Suggested Topics */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Trending Topics</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Large Language Models",
              "Quantum Computing",
              "Reinforcement Learning",
              "Multimodal AI"
            ].map((topic) => (
              <Card 
                key={topic}
                className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-paper-card-hover"
                onClick={() => navigate(`/search?q=${encodeURIComponent(topic)}`)}
              >
                <h3 className="font-medium text-sm text-foreground">{topic}</h3>
              </Card>
            ))}
          </div>
        </div>

        {/* Pull to refresh hint */}
        <div className="text-center text-xs text-muted-foreground py-4">
          Pull to refresh for new suggestions
        </div>
      </div>
    </AppLayout>
  );
}