import { useState, useEffect } from "react";
import { ArrowLeft, MoreVertical, Trash2, Download, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { apiService, LibraryPaper } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const allTags = ["AI", "NLP", "Computer Vision", "Code Generation", "To Read", "Climate Change", "Neural Networks", "Transformers"];

export default function Library() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [libraryPapers, setLibraryPapers] = useState<LibraryPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getLibrary();
      setLibraryPapers(response.papers);
    } catch (error) {
      console.error("Failed to load library:", error);
      toast({
        title: "Error",
        description: "Failed to load library. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const removeFromLibrary = async (arxiv_id: string) => {
    try {
      await apiService.removeFromLibrary(arxiv_id);
      setLibraryPapers(prev => prev.filter(paper => paper.arxiv_id !== arxiv_id));
      toast({
        title: "Success",
        description: "Paper removed from library",
      });
    } catch (error) {
      console.error("Failed to remove paper:", error);
      toast({
        title: "Error",
        description: "Failed to remove paper from library.",
        variant: "destructive",
      });
    }
  };

  const filteredPapers = libraryPapers.filter(paper => {
    if (selectedTags.length === 0) return true;
    return selectedTags.some(tag => paper.tags.includes(tag));
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">My Library</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading library...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">My Library</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="tags">By Tag</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Tag Filters */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Filter by tags:</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Papers List */}
            <div className="space-y-3">
              {filteredPapers.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Your library is empty</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by searching for papers and saving them to your library
                  </p>
                  <Button onClick={() => navigate("/search")}>
                    Search Papers
                  </Button>
                </div>
              ) : (
                filteredPapers.map((paper) => (
                  <Card key={paper.id} className="p-4">
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-2">
                        <h3 
                          className="font-medium text-foreground leading-tight cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/paper/${paper.arxiv_id}`)}
                        >
                          {paper.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground">
                          Authors: {paper.authors.join(", ")}
                        </p>
                        
                        <div className="flex flex-wrap gap-1">
                          {paper.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {paper.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            "{paper.notes}"
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          Added: {new Date(paper.date_added).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeFromLibrary(paper.arxiv_id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            {allTags.map((tag) => {
              const tagPapers = libraryPapers.filter(paper => paper.tags.includes(tag));
              if (tagPapers.length === 0) return null;
              
              return (
                <Card key={tag} className="p-4">
                  <h3 className="font-medium text-foreground mb-2">
                    {tag} ({tagPapers.length})
                  </h3>
                  <div className="space-y-2">
                    {tagPapers.map((paper) => (
                      <div 
                        key={paper.id}
                        className="text-sm text-foreground cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/paper/${paper.arxiv_id}`)}
                      >
                        {paper.title}
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            {libraryPapers
              .filter(paper => paper.notes)
              .map((paper) => (
                <Card key={paper.id} className="p-4">
                  <h3 
                    className="font-medium text-foreground mb-2 cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/paper/${paper.arxiv_id}`)}
                  >
                    {paper.title}
                  </h3>
                  <p className="text-sm text-muted-foreground italic">
                    "{paper.notes}"
                  </p>
                </Card>
              ))}
          </TabsContent>
        </Tabs>

        {/* Bulk Actions */}
        {libraryPapers.length > 0 && (
          <div className="fixed bottom-20 left-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg">
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="flex-1">
                Batch Select
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-1" />
                Export as Text
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}