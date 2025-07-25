import { useState } from "react";
import { ArrowLeft, Star, Share, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";

const mockPaper = {
  id: "2307.03456",
  title: "Attention Is All You Need: Transformer Architecture for Natural Language Processing",
  authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Llion Jones"],
  abstract: `We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature. We show that the Transformer generalizes well to other tasks by applying it successfully to English constituency parsing both with large and limited training data.`,
  subjects: ["Artificial Intelligence", "Machine Learning", "Natural Language Processing", "Computer Science"],
  date: "July 15, 2023",
  arxivId: "1907.03456",
  pdfUrl: "#",
  citations: 1247,
  saved: false
};

export default function PaperDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const [saved, setSaved] = useState(mockPaper.saved);

  const truncatedAbstract = mockPaper.abstract.slice(0, 200) + "...";

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
            {mockPaper.title}
          </h1>
          <p className="text-muted-foreground">
            Authors: {mockPaper.authors.join(", ")}
          </p>
        </div>

        {/* Metadata */}
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-foreground">ID:</span>
              <span className="ml-2 text-muted-foreground">{mockPaper.arxivId}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">Date:</span>
              <span className="ml-2 text-muted-foreground">{mockPaper.date}</span>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-foreground">Citations:</span>
              <span className="ml-2 text-muted-foreground">{mockPaper.citations}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="font-medium text-foreground text-sm">Subjects:</span>
            <div className="flex flex-wrap gap-1">
              {mockPaper.subjects.map((subject) => (
                <Badge key={subject} variant="secondary" className="text-xs">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Abstract */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium text-foreground">Abstract</h2>
          </div>
          
          <p className="text-sm text-foreground leading-relaxed">
            {showFullAbstract ? mockPaper.abstract : truncatedAbstract}
          </p>
          
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
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={saved ? "default" : "outline"}
              onClick={() => setSaved(!saved)}
              className="flex items-center gap-2"
            >
              <Star className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
              {saved ? "Saved to Library" : "Save to Library"}
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Highlight & Note
            </Button>
          </div>
          
          <Button variant="outline" className="w-full flex items-center gap-2">
            <Share className="h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Related Papers */}
        <Card className="p-4 space-y-3">
          <h3 className="font-medium text-foreground">Related Papers</h3>
          <div className="space-y-2">
            {[
              "BERT: Pre-training of Deep Bidirectional Transformers",
              "GPT-3: Language Models are Few-Shot Learners",
              "T5: Text-to-Text Transfer Transformer"
            ].map((title, index) => (
              <div key={index} className="text-sm text-primary cursor-pointer hover:underline">
                {title}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}