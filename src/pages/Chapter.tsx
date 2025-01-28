import { VocabularyForm } from "@/components/VocabularyForm";
import { useParams } from "react-router-dom";

const Chapter = () => {
  const { id } = useParams();
  const chapterId = Number(id);

  const handleAddVocabulary = (vocabulary: any) => {
    console.log("Added vocabulary:", vocabulary);
    // TODO: Implement vocabulary storage
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-sakura-700">Add Vocabulary</h1>
      <VocabularyForm chapterId={chapterId} onAdd={handleAddVocabulary} />
    </div>
  );
};

export default Chapter;