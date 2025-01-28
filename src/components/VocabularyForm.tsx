import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface VocabularyFormProps {
  chapterId: number;
  onAdd: (vocabulary: any) => void;
}

export const VocabularyForm = ({ chapterId, onAdd }: VocabularyFormProps) => {
  const [writingSystem, setWritingSystem] = useState<"hiragana" | "katakana">("hiragana");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const vocabulary = {
      meaning: formData.get("meaning"),
      reading: formData.get("reading"),
      kanji: writingSystem === "hiragana" ? formData.get("kanji") : null,
      chapterId,
      writingSystem,
    };

    onAdd(vocabulary);
    form.reset();
    toast({
      title: "Vocabulary added",
      description: "New vocabulary has been added to the chapter",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Select
          onValueChange={(value: "hiragana" | "katakana") => setWritingSystem(value)}
          defaultValue="hiragana"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select writing system" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hiragana">Hiragana</SelectItem>
            <SelectItem value="katakana">Katakana</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Input name="meaning" placeholder="Meaning" required />
      <Input name="reading" placeholder={`Reading (${writingSystem})`} required />
      
      {writingSystem === "hiragana" && (
        <Input name="kanji" placeholder="Kanji" required />
      )}

      <Button type="submit" className="w-full bg-sakura-500 hover:bg-sakura-600">
        Add Vocabulary
      </Button>
    </form>
  );
};