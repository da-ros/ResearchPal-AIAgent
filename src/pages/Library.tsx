import { useState } from "react";
import { ArrowLeft, MoreVertical, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const mockSavedPapers = [
  {
    id: "2308.12345",
    title: "Large Language Models for Code Generation: A Comprehensive Survey",
    authors: ["Smith, J.", "Johnson, M."],
    tags: ["AI", "Code Generation"],
    dateAdded: "2024-01-15",
    notes: "Interesting survey on LLMs for coding"
  },
  {
    id: "2307.03456",
    title: "Attention Is All You Need: Transformer Architecture",
    authors: ["Vaswani, A.", "Shazeer, N."],
    tags: ["AI", "NLP", "To Read"],
    dateAdded: "2024-01-10",
    notes: ""
  },
  {
    id: "2309.67890",
    title: "Multimodal Learning with Vision Transformers",
    authors: ["Brown, R.", "Davis, S."],
    tags: ["Computer Vision", "AI"],
    dateAdded: "2024-01-08",
    notes: "Good reference for multimodal work"
  }
];

const allTags = ["AI", "NLP", "Computer Vision", "Code Generation", "To Read"];

export default function Library() {
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredPapers = mockSavedPapers.filter(paper => {
    if (selectedTags.length === 0) return true;
    return selectedTags.some(tag => paper.tags.includes(tag));
  });

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
              {filteredPapers.map((paper) => (
                <Card key={paper.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-2">
                      <h3 
                        className="font-medium text-foreground leading-tight cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/paper/${paper.id}`)}
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
                        Added: {new Date(paper.dateAdded).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            {allTags.map((tag) => {
              const tagPapers = mockSavedPapers.filter(paper => paper.tags.includes(tag));
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
                        onClick={() => navigate(`/paper/${paper.id}`)}
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
            {mockSavedPapers
              .filter(paper => paper.notes)
              .map((paper) => (
                <Card key={paper.id} className="p-4">
                  <h3 
                    className="font-medium text-foreground mb-2 cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/paper/${paper.id}`)}
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
      </div>
    </div>
  );
}