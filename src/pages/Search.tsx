import { useState, useEffect } from "react";
import { ArrowLeft, X, Filter, Star, Info, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";

const mockResults = [
  {
    id: "2307.03456",
    title: "Attention Is All You Need: Transformer Architecture for Natural Language Processing",
    authors: ["Vaswani, A.", "Shazeer, N.", "Parmar, N."],
    abstract: "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely...",
    subjects: ["AI", "NLP", "Deep Learning"],
    date: "2023-07-15",
    saved: false
  },
  {
    id: "2308.12345",
    title: "Large Language Models for Code Generation: A Comprehensive Survey",
    authors: ["Smith, J.", "Johnson, M.", "Lee, K."],
    abstract: "Recent advances in large language models have shown remarkable capabilities in code generation tasks. This survey provides a comprehensive overview...",
    subjects: ["AI", "Code Generation", "Software Engineering"],
    date: "2023-08-20",
    saved: true
  },
  {
    id: "2309.67890",
    title: "Multimodal Learning with Vision Transformers",
    authors: ["Brown, R.", "Davis, S."],
    abstract: "Vision Transformers have revolutionized computer vision tasks. In this work, we explore their application to multimodal learning scenarios...",
    subjects: ["Computer Vision", "Multimodal AI", "Transformers"],
    date: "2023-09-10",
    saved: false
  }
];

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState(mockResults);
  const [savedPapers, setSavedPapers] = useState<Set<string>>(new Set(["2308.12345"]));

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  const toggleSave = (paperId: string) => {
    setSavedPapers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paperId)) {
        newSet.delete(paperId);
      } else {
        newSet.add(paperId);
      }
      return newSet;
    });
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
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Results */}
      <div className="flex-1 p-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {results.length.toLocaleString()} results for "{query || "all papers"}"
          </p>
        </div>

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
                      onClick={() => navigate(`/paper/${paper.id}`)}
                    >
                      {index + 1}. {paper.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Authors: {paper.authors.join(", ")}
                  </p>
                  
                  <p className="text-sm text-foreground line-clamp-2">
                    "{paper.abstract}"
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {paper.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={savedPapers.has(paper.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSave(paper.id)}
                    >
                      <Star className={`h-4 w-4 mr-1 ${savedPapers.has(paper.id) ? "fill-current" : ""}`} />
                      {savedPapers.has(paper.id) ? "Saved" : "Save"}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/paper/${paper.id}`)}
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
      </div>
    </div>
  );
}