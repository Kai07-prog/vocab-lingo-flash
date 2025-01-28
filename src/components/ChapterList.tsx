import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface Chapter {
  id: number;
  name: string;
}

export const ChapterList = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newChapterName, setNewChapterName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const addChapter = () => {
    if (newChapterName.trim()) {
      const newChapter = {
        id: chapters.length + 1,
        name: newChapterName.trim(),
      };
      setChapters([...chapters, newChapter]);
      setNewChapterName("");
      setIsDialogOpen(false);
      toast({
        title: "Chapter added",
        description: `${newChapter.name} has been created`,
      });
    }
  };

  const handleChapterClick = (chapterId: number) => {
    navigate(`/chapter/${chapterId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-sakura-700">Japanese Vocabulary</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-sakura-500 hover:bg-sakura-600">
          <Plus className="mr-2 h-4 w-4" /> Add Chapter
        </Button>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter chapter name"
              value={newChapterName}
              onChange={(e) => setNewChapterName(e.target.value)}
            />
            <Button onClick={addChapter} className="w-full bg-sakura-500 hover:bg-sakura-600">
              Create Chapter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((chapter) => (
          <Card 
            key={chapter.id} 
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleChapterClick(chapter.id)}
          >
            <h2 className="text-xl font-bold">{chapter.name}</h2>
          </Card>
        ))}
      </div>
    </div>
  );
};