import { useState, useEffect } from "react";
import { ArrowLeft, Star, Share, FileText, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface PaperDetail {
  title: string;
  authors: string[];
  abstract: string;
  arxiv_id: string;
  published_date?: string;
  categories?: string[];
  pdf_url?: string;
  entry_url?: string;
  journal_ref?: string;
  doi?: string;
}

export default function PaperDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [paper, setPaper] = useState<PaperDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchPaperDetails(id);
    }
  }, [id]);

  const fetchPaperDetails = async (arxivId: string) => {
    setIsLoading(true);
    try {
      // Use the chat API to get paper details
      const response = await apiService.chat({
        message: `Use the get_information_from_arxiv tool to get detailed information about the paper with arXiv ID ${arxivId}. Please provide the full paper details including title, authors, abstract, and all available metadata.`,
        session_id: `paper-detail-${arxivId}`
      });
      
      // Parse the response to extract paper details
      const paperData = parsePaperResponse(response.response, arxivId);
      setPaper(paperData);
    } catch (error) {
      console.error("Failed to fetch paper details:", error);
      toast({
        title: "Error",
        description: "Failed to load paper details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveToLibrary = async () => {
    if (!paper) return;
    
    try {
      await apiService.saveToLibrary({
        arxiv_id: paper.arxiv_id,
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        tags: paper.categories || [],
        notes: ""
      });
      
      setSaved(true);
      toast({
        title: "Success",
        description: "Paper saved to library",
      });
    } catch (error) {
      console.error("Failed to save paper:", error);
      toast({
        title: "Error",
        description: "Failed to save paper to library.",
        variant: "destructive",
      });
    }
  };

  const parsePaperResponse = (response: string, arxivId: string): PaperDetail => {
    // Default paper data
    const defaultPaper: PaperDetail = {
      title: `Paper ${arxivId}`,
      authors: [],
      abstract: "Abstract not available",
      arxiv_id: arxivId,
    };

    try {
      console.log("Parsing response:", response);
      
      // Try structured format first (with **Title:**, **Authors:**, etc.)
      const titleMatch = response.match(/\*\*Title:\*\* (.+?)(?:\n|$)/);
      if (titleMatch) {
        defaultPaper.title = titleMatch[1].trim();
      } else {
        // Fallback to natural language format
        const titleMatch2 = response.match(/titled "([^"]+)"/);
        if (titleMatch2) {
          defaultPaper.title = titleMatch2[1].trim();
        }
      }

      // Extract authors - try structured format first
      const authorsMatch = response.match(/\*\*Authors:\*\* (.+?)(?:\n|$)/);
      if (authorsMatch) {
        defaultPaper.authors = authorsMatch[1].split(',').map(author => author.trim());
      } else {
        // Fallback to natural language format
        const authorsMatch2 = response.match(/authored by ([^.]+)/);
        if (authorsMatch2) {
          defaultPaper.authors = authorsMatch2[1].split(',').map(author => author.trim());
        }
      }

      // Extract abstract - try structured format first
      const abstractMatch = response.match(/\*\*Abstract:\*\*\s*\n([\s\S]*?)(?:\*\*Additional Information:\*\*|\*\*Summary:\*\*|$)/);
      if (abstractMatch) {
        defaultPaper.abstract = abstractMatch[1].trim();
      } else {
        // Fallback to natural language format
        const abstractMatch2 = response.match(/abstract of the paper discusses ([^.]+\.)/);
        if (abstractMatch2) {
          defaultPaper.abstract = abstractMatch2[1].trim();
        } else {
          // Try alternative pattern for abstract
          const altAbstractMatch = response.match(/The abstract of the paper discusses ([^.]+\.)/);
          if (altAbstractMatch) {
            defaultPaper.abstract = altAbstractMatch[1].trim();
          }
        }
      }

      // Extract published date - try structured format first
      const dateMatch = response.match(/\*\*Published:\*\* (.+?)(?:\n|$)/);
      if (dateMatch) {
        defaultPaper.published_date = dateMatch[1].trim();
      } else {
        // Fallback to natural language format
        const dateMatch2 = response.match(/published on ([^.]+)/);
        if (dateMatch2) {
          defaultPaper.published_date = dateMatch2[1].trim();
        }
      }

      // Extract categories - try structured format first
      const categoriesMatch = response.match(/\*\*Categories:\*\* (.+?)(?:\n|$)/);
      if (categoriesMatch) {
        defaultPaper.categories = categoriesMatch[1].split(',').map(cat => cat.trim());
      } else {
        // Fallback to natural language format
        const categoriesMatch2 = response.match(/categorized under ([^.]+)/);
        if (categoriesMatch2) {
          defaultPaper.categories = categoriesMatch2[1].split(',').map(cat => cat.trim());
        }
      }

      // Extract PDF URL - try structured format first
      const pdfMatch = response.match(/\*\*PDF URL:\*\* (.+?)(?:\n|$)/);
      if (pdfMatch) {
        defaultPaper.pdf_url = pdfMatch[1].trim();
      } else {
        // Fallback to natural language format
        const pdfMatch2 = response.match(/PDF URL: ([^\n]+)/);
        if (pdfMatch2) {
          defaultPaper.pdf_url = pdfMatch2[1].trim();
        }
      }

      // Extract entry URL - try structured format first
      const entryMatch = response.match(/\*\*Entry URL:\*\* (.+?)(?:\n|$)/);
      if (entryMatch) {
        defaultPaper.entry_url = entryMatch[1].trim();
      } else {
        // Fallback to natural language format
        const entryMatch2 = response.match(/Entry URL: ([^\n]+)/);
        if (entryMatch2) {
          defaultPaper.entry_url = entryMatch2[1].trim();
        }
      }

      // Extract journal reference - try structured format first
      const journalMatch = response.match(/\*\*Journal Reference:\*\* (.+?)(?:\n|$)/);
      if (journalMatch) {
        defaultPaper.journal_ref = journalMatch[1].trim();
      } else {
        // Fallback to natural language format
        const journalMatch2 = response.match(/Journal Reference: ([^\n]+)/);
        if (journalMatch2) {
          defaultPaper.journal_ref = journalMatch2[1].trim();
        }
      }

      // Extract DOI - try structured format first
      const doiMatch = response.match(/\*\*DOI:\*\* (.+?)(?:\n|$)/);
      if (doiMatch) {
        defaultPaper.doi = doiMatch[1].trim();
      } else {
        // Fallback to natural language format
        const doiMatch2 = response.match(/DOI: ([^\n]+)/);
        if (doiMatch2) {
          defaultPaper.doi = doiMatch2[1].trim();
        }
      }

      console.log("Parsed paper data:", defaultPaper);

    } catch (error) {
      console.error("Error parsing paper response:", error);
    }

    return defaultPaper;
  };

  const truncatedAbstract = paper?.abstract ? 
    (paper.abstract.length > 200 ? paper.abstract.slice(0, 200) + "..." : paper.abstract) : 
    "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Paper Details</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading paper details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Paper Details</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Paper not found</p>
            <Button onClick={() => navigate(-1)} className="mt-2">
              Go Back
            </Button>
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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Paper Details</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Title and Authors */}
        <div className="space-y-3">
          <h1 className="text-xl font-bold text-foreground leading-tight">
            {paper.title}
          </h1>
          {paper.authors.length > 0 && (
            <p className="text-muted-foreground">
              Authors: {paper.authors.join(", ")}
            </p>
          )}
        </div>

        {/* Metadata */}
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-foreground">arXiv ID:</span>
              <span className="ml-2 text-muted-foreground">{paper.arxiv_id}</span>
            </div>
            {paper.published_date && (
              <div>
                <span className="font-medium text-foreground">Published:</span>
                <span className="ml-2 text-muted-foreground">{paper.published_date}</span>
              </div>
            )}
            {paper.doi && (
              <div className="col-span-2">
                <span className="font-medium text-foreground">DOI:</span>
                <span className="ml-2 text-muted-foreground">{paper.doi}</span>
              </div>
            )}
          </div>
          
          {paper.categories && paper.categories.length > 0 && (
            <div className="space-y-2">
              <span className="font-medium text-foreground text-sm">Categories:</span>
              <div className="flex flex-wrap gap-1">
                {paper.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Abstract */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium text-foreground">Abstract</h2>
          </div>
          
          <p className="text-sm text-foreground leading-relaxed">
            {showFullAbstract ? paper.abstract : truncatedAbstract}
          </p>
          
          {paper.abstract.length > 200 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullAbstract(!showFullAbstract)}
              className="w-full justify-center"
            >
              {showFullAbstract ? (
                <>
                  Show Less <ChevronUp className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Show More <ChevronDown className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={saved ? "default" : "outline"}
              onClick={saveToLibrary}
              disabled={saved}
              className="flex items-center gap-2"
            >
              <Star className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
              {saved ? "Saved to Library" : "Save to Library"}
            </Button>
            
            {paper.pdf_url && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => window.open(paper.pdf_url, '_blank')}
              >
                <FileText className="h-4 w-4" />
                View PDF
              </Button>
            )}
          </div>
          
          <Button variant="outline" className="w-full flex items-center gap-2">
            <Share className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}