import { useState, useEffect } from "react";
import { ArrowLeft, X, Filter, Star, Info, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiService, Paper, RecentSearchesService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedPapers, setSavedPapers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.search({ query: searchQuery });
      setResults(response.papers);
      
      // Save to recent searches
      RecentSearchesService.addRecentSearch(searchQuery, response.total);
      
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Search failed",
        description: "Unable to search for papers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      performSearch(query);
    }
  };

  const toggleSave = async (paper: Paper) => {
    try {
      if (savedPapers.has(paper.id)) {
        // Remove from library
        await apiService.removeFromLibrary(paper.arxiv_id || paper.id);
        setSavedPapers(prev => {
          const newSet = new Set(prev);
          newSet.delete(paper.id);
          return newSet;
        });
        toast({
          title: "Removed",
          description: "Paper removed from library",
        });
      } else {
        // Save to library
        await apiService.saveToLibrary({
          arxiv_id: paper.arxiv_id || paper.id,
          title: paper.title,
          authors: paper.authors,
          abstract: paper.abstract,
          tags: paper.subjects,
          notes: ""
        });
        setSavedPapers(prev => new Set([...prev, paper.id]));
        toast({
          title: "Saved",
          description: "Paper saved to library",
        });
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
      toast({
        title: "Error",
        description: "Failed to save/remove paper from library.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search papers..."
              className="pr-20"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-10 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleSearch}
            disabled={isLoading}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Results */}
      <div className="flex-1 p-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Searching..." : `${results.length.toLocaleString()} results for "${query || "all papers"}"`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((paper, index) => (
              <Card key={paper.id} className="p-4 hover:shadow-md transition-all duration-200">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 
                        className="font-medium text-foreground leading-tight cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/paper/${paper.arxiv_id || paper.id}`)}
                      >
                        {index + 1}. {paper.title}
                      </h3>
                    </div>
                    
                    {paper.authors.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Authors: {paper.authors.join(", ")}
                      </p>
                    )}
                    
                    <p className="text-sm text-foreground line-clamp-2">
                      "{paper.abstract}"
                    </p>
                    
                    {paper.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {paper.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant={savedPapers.has(paper.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSave(paper)}
                      >
                        <Star className={`h-4 w-4 mr-1 ${savedPapers.has(paper.id) ? "fill-current" : ""}`} />
                        {savedPapers.has(paper.id) ? "Saved" : "Save"}
                      </Button>
                    
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/paper/${paper.arxiv_id || paper.id}`)}
                      >
                        <Info className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}