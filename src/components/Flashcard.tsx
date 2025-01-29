import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";

interface FlashcardProps {
  front: string;
  back: string;
  onDelete: () => void;
  onEdit: () => void;
}

export const Flashcard = ({ front, back, onDelete, onEdit }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div
        className={`flip-card h-48 w-full ${isFlipped ? "flipped" : ""}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flip-card-inner">
          <Card className="flip-card-front flex items-center justify-center p-6">
            <span className="text-2xl font-japanese">{front}</span>
          </Card>
          
          <Card className="flip-card-back flex items-center justify-center p-6">
            <span className="text-2xl font-japanese">{back}</span>
          </Card>
        </div>
      </div>
    </div>
  );
};