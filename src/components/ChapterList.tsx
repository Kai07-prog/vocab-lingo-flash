import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface Chapter {
  id: number;
  name: string;
}

export const ChapterList = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newChapterName, setNewChapterName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch chapters when component mounts
  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Error fetching chapters",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setChapters(data);
    }
  };

  const addChapter = async () => {
    if (newChapterName.trim()) {
      const { data, error } = await supabase
        .from('chapters')
        .insert([
          { name: newChapterName.trim() }
        ])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error adding chapter",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setChapters([...chapters, data]);
        setNewChapterName("");
        setIsAdding(false);
        toast({
          title: "Chapter added",
          description: `${data.name} has been created`,
          duration: 2000,
        });
      }
    }
  };

  const startEditing = (chapter: Chapter) => {
    setEditingId(chapter.id);
    setEditingName(chapter.name);
  };

  const saveEdit = async (id: number) => {
    if (editingName.trim()) {
      const { error } = await supabase
        .from('chapters')
        .update({ name: editingName.trim() })
        .eq('id', id);

      if (error) {
        toast({
          title: "Error updating chapter",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setChapters(chapters.map(ch => 
        ch.id === id ? { ...ch, name: editingName.trim() } : ch
      ));
      setEditingId(null);
      setEditingName("");
      toast({
        title: "Chapter updated",
        description: "The chapter name has been updated",
      });
    }
  };

  const deleteChapter = async (id: number) => {
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting chapter",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setChapters(chapters.filter(ch => ch.id !== id));
    toast({
      title: "Chapter deleted",
      description: "The chapter has been removed",
    });
  };

  const handleChapterClick = (chapterId: number) => {
    if (editingId === null) {
      navigate(`/chapter/${chapterId}`);
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-b from-sakura-50 to-white">
      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-sakura-700 font-japanese mb-2">単語帳</h1>
            <p className="text-zen-600">Vocabulary Notebook</p>
          </div>
          <Button 
            onClick={() => setIsAdding(true)} 
            className="bg-sakura-500 hover:bg-sakura-600 text-white shadow-lg transition-all hover:shadow-xl"
            disabled={isAdding}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Chapter
          </Button>
        </div>
        
        {isAdding && (
          <div className="mb-8 space-y-4">
            <Input
              placeholder="Enter chapter name"
              value={newChapterName}
              onChange={(e) => setNewChapterName(e.target.value)}
              className="w-full"
              autoFocus
            />
            <div className="flex gap-2">
              <Button 
                onClick={addChapter}
                className="bg-sakura-500 hover:bg-sakura-600"
              >
                Add
              </Button>
              <Button 
                onClick={() => {
                  setIsAdding(false);
                  setNewChapterName("");
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter) => (
            <Card 
              key={chapter.id} 
              className="p-6 hover:shadow-lg transition-all cursor-pointer bg-white/80 backdrop-blur-sm border-sakura-100 hover:border-sakura-200"
              onClick={() => handleChapterClick(chapter.id)}
            >
              <div className="flex items-center justify-between">
                {editingId === chapter.id ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 mr-2"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-zen-800 font-japanese">{chapter.name}</h2>
                )}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {editingId === chapter.id ? (
                    <>
                      <Button
                        size="sm"
                        className="bg-sakura-500 hover:bg-sakura-600"
                        onClick={() => saveEdit(chapter.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(chapter)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => deleteChapter(chapter.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
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