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
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-b from-sakura-50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-sakura-700 font-japanese mb-2">単語帳</h1>
            <p className="text-zen-600">Vocabulary Notebook</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="bg-sakura-500 hover:bg-sakura-600 text-white shadow-lg transition-all hover:shadow-xl"
          >
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter) => (
            <Card 
              key={chapter.id} 
              className="p-8 hover:shadow-lg transition-all cursor-pointer bg-white/80 backdrop-blur-sm border-sakura-100 hover:border-sakura-200"
              onClick={() => handleChapterClick(chapter.id)}
            >
              <h2 className="text-2xl font-bold text-zen-800 font-japanese">{chapter.name}</h2>
            </Card>
          ))}
        </div>
        
        {chapters.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zen-500 text-lg">No chapters yet. Create your first chapter to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};