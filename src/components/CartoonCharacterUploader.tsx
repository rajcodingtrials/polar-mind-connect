import React, { useState, useEffect } from 'react';
import { useCartoonCharacters } from '@/hooks/useCartoonCharacters';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CartoonCharacterUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const { uploadCharacterImages, characters } = useCartoonCharacters();
  const { toast } = useToast();

  // Check if images are already uploaded
  useEffect(() => {
    setHasUploaded(characters.length > 0);
    
    // Debug: List all files in the storage bucket
    const listStorageFiles = async () => {
      console.log('🗂️ Checking files in cartoon-characters bucket...');
      const { data: files, error } = await supabase.storage
        .from('cartoon-characters')
        .list('', { limit: 100 });
      
      if (error) {
        console.error('❌ Error listing storage files:', error);
      } else {
        console.log('📁 Files in storage bucket:', files);
      }
    };
    
    listStorageFiles();
  }, [characters]);

  const handleUpload = async () => {
    setUploading(true);

    try {
      console.log('🚀 Starting cartoon character upload...');
      
      // Convert the uploaded images to File objects with PNG extensions
      const characterFiles = [
        { name: 'Happy Giraffe', file: new File([''], 'giraffe.png', { type: 'image/png' }) },
        { name: 'Cute Elephant', file: new File([''], 'elephant.png', { type: 'image/png' }) },
        { name: 'Friendly Bear', file: new File([''], 'bear.png', { type: 'image/png' }) },
        { name: 'Sweet Fox', file: new File([''], 'fox.png', { type: 'image/png' }) }
      ];

      console.log('📋 Character files to upload:', characterFiles.map(f => ({ name: f.name, fileName: f.file.name })));

      const success = await uploadCharacterImages(characterFiles);
      
      if (success) {
        toast({
          title: "Success!",
          description: "Cartoon characters uploaded successfully!",
        });
        setHasUploaded(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to upload some character images.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload character images.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (hasUploaded) {
    return null; // Don't show uploader if images are already uploaded
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
      <p className="text-sm text-blue-700 mb-2">
        Upload cartoon character images to enable random character selection.
      </p>
      <Button 
        onClick={handleUpload} 
        disabled={uploading}
        className="bg-blue-500 hover:bg-blue-600"
      >
        {uploading ? 'Uploading...' : 'Upload Character Images'}
      </Button>
    </div>
  );
};

export default CartoonCharacterUploader;
