
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
}

interface QuestionUploadProps {
  onQuestionsUploaded: (questions: Question[], images: File[]) => void;
}

const QuestionUpload = ({ onQuestionsUploaded }: QuestionUploadProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const { toast } = useToast();

  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        if (Array.isArray(jsonData)) {
          const formattedQuestions = jsonData.map((item, index) => ({
            id: `q_${index}`,
            question: item.question || '',
            answer: item.answer || '',
            imageName: item.imageName || item.image || ''
          }));
          setQuestions(formattedQuestions);
          toast({
            title: "Questions loaded",
            description: `Loaded ${formattedQuestions.length} questions from JSON file`,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid JSON file format",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files]);
    toast({
      title: "Images uploaded",
      description: `Added ${files.length} images`,
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a questions JSON file first",
        variant: "destructive",
      });
      return;
    }

    onQuestionsUploaded(questions, images);
    toast({
      title: "Success",
      description: "Questions and images uploaded successfully!",
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Questions & Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Questions JSON File
          </label>
          <Input
            type="file"
            accept=".json"
            onChange={handleJsonUpload}
            className="cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: [{"question": "What is this?", "answer": "apple", "imageName": "apple.jpg"}]
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <ImageIcon className="w-4 h-4 inline mr-1" />
            Images
          </label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="cursor-pointer"
          />
        </div>

        {questions.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Loaded Questions ({questions.length})</h3>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {questions.slice(0, 5).map((q, index) => (
                <div key={q.id} className="text-sm p-2 bg-gray-50 rounded">
                  <strong>Q:</strong> {q.question} | <strong>A:</strong> {q.answer}
                </div>
              ))}
              {questions.length > 5 && (
                <p className="text-xs text-gray-500">...and {questions.length - 5} more</p>
              )}
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Uploaded Images ({images.length})</h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <div className="bg-gray-100 p-2 rounded text-xs flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {img.name}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 w-4 h-4 opacity-0 group-hover:opacity-100"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="w-2 h-2" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={questions.length === 0}
        >
          Upload Questions & Images
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuestionUpload;
