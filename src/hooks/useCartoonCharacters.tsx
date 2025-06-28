
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CartoonCharacter {
  id: string;
  name: string;
  storage_path: string;
  animal_type: string;
  image_url?: string;
}

export const useCartoonCharacters = () => {
  const [characters, setCharacters] = useState<CartoonCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<CartoonCharacter | null>(null);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      // Load character metadata from database
      const { data: charactersData, error } = await supabase
        .from('cartoon_characters')
        .select('*');

      if (error) {
        console.error('Error loading characters:', error);
        return;
      }

      if (charactersData && charactersData.length > 0) {
        // Get public URLs for each character
        const charactersWithUrls = charactersData.map(character => {
          const { data } = supabase.storage
            .from('cartoon-characters')
            .getPublicUrl(character.storage_path);
          
          return {
            ...character,
            image_url: data.publicUrl
          };
        });

        setCharacters(charactersWithUrls);
        
        // Select a random character if none is selected
        if (!selectedCharacter && charactersWithUrls.length > 0) {
          const randomIndex = Math.floor(Math.random() * charactersWithUrls.length);
          setSelectedCharacter(charactersWithUrls[randomIndex]);
        }
      }
    } catch (error) {
      console.error('Error loading cartoon characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectRandomCharacter = () => {
    if (characters.length > 0) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      setSelectedCharacter(characters[randomIndex]);
    }
  };

  const uploadCharacterImages = async (files: { name: string; file: File }[]) => {
    const uploadPromises = files.map(async ({ name, file }) => {
      const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      
      const { error } = await supabase.storage
        .from('cartoon-characters')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error(`Error uploading ${fileName}:`, error);
        return false;
      }
      
      return true;
    });

    const results = await Promise.all(uploadPromises);
    const allUploaded = results.every(result => result === true);
    
    if (allUploaded) {
      await loadCharacters(); // Reload characters after upload
    }
    
    return allUploaded;
  };

  return {
    characters,
    loading,
    selectedCharacter,
    selectRandomCharacter,
    uploadCharacterImages,
    loadCharacters
  };
};
