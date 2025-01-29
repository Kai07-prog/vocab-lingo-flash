import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";

interface FlashcardProps {
  front: string;
  back: string;
  onDelete: () => void;
  onEdit: () => void;
  writingSystem: "hiragana" | "katakana";
  isKanji?: boolean;
}

export const Flashcard = ({ 
  front, 
  back, 
  onDelete, 
  onEdit, 
  writingSystem,
  isKanji = false 
}: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExiting(true);
    setTimeout(() => {
      onDelete();
    }, 300);
  };

  const textClass = isKanji 
    ? "japanese-text-kanji"
    : writingSystem === "hiragana" 
      ? "japanese-text-hiragana" 
      : "japanese-text-katakana";

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
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div
        className={`flip-card h-48 w-full ${isFlipped ? "flipped" : ""} ${isExiting ? "exit" : ""}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flip-card-inner">
          <Card className="flip-card-front flex flex-col items-center justify-center gap-2 p-6">
            {isKanji ? (
              <>
                <span className="japanese-text-hiragana">{front}</span>
                <span className={textClass}>{front}</span>
              </>
            ) : (
              <span className={textClass}>{front}</span>
            )}
          </Card>
          
          <Card className="flip-card-back flex items-center justify-center p-6">
            <span className="text-xl">{back}</span>
          </Card>
        </div>
      </div>
    </div>
  );
};