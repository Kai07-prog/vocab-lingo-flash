import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, BookOpen, PenLine } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Chapter {
  id: number;
  name: string;
}

export const ChapterList = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const { toast } = useToast();

  const addChapter = () => {
    const newChapter = {
      id: chapters.length + 1,
      name: `Chapter ${chapters.length + 1}`,
    };
    setChapters([...chapters, newChapter]);
    toast({
      title: "Chapter added",
      description: `${newChapter.name} has been created`,
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-sakura-700">Japanese Vocabulary</h1>
        <Button onClick={addChapter} className="bg-sakura-500 hover:bg-sakura-600">
          <Plus className="mr-2 h-4 w-4" /> Add Chapter
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((chapter) => (
          <Card key={chapter.id} className="p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-4">{chapter.name}</h2>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1">
                <BookOpen className="mr-2 h-4 w-4" /> Review
              </Button>
              <Button variant="outline" className="flex-1">
                <PenLine className="mr-2 h-4 w-4" /> Test
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};