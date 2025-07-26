import { useState, useEffect } from "react";
import { Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import { RecentSearchesService } from "@/services/api";

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<Array<{ topic: string; count: number; timestamp: number }>>([]);

  useEffect(() => {
    // Load recent searches on component mount
    setRecentSearches(RecentSearchesService.getRecentSearches());
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      RecentSearchesService.addRecentSearch(query);
      setRecentSearches(RecentSearchesService.getRecentSearches());
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRecentSearchClick = (topic: string) => {
    RecentSearchesService.addRecentSearch(topic);
    setRecentSearches(RecentSearchesService.getRecentSearches());
    navigate(`/search?q=${encodeURIComponent(topic)}`);
  };

  const handleTrendingTopicClick = (topic: string) => {
    RecentSearchesService.addRecentSearch(topic);
    setRecentSearches(RecentSearchesService.getRecentSearches());
    navigate(`/search?q=${encodeURIComponent(topic)}`);
  };

  return (
    <AppLayout headerTitle="ResearchPal">
      <div className="p-4 space-y-6">
        {/* Quick Search Input */}
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask the Assistant About Research..."
            className="h-14 text-base pr-12"
          />
          <Button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
            size="icon"
            disabled={!searchQuery.trim()}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Searches</h2>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {recentSearches.map((search, index) => (
                <Card 
                  key={index}
                  className="flex-shrink-0 p-4 w-36 cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-paper-card-hover"
                  onClick={() => handleRecentSearchClick(search.topic)}
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
        )}

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
                onClick={() => handleTrendingTopicClick(topic)}
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