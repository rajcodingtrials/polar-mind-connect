
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
      console.log('🔍 Loading cartoon characters from database...');
      
      // Load character metadata from database
      const { data: charactersData, error } = await supabase
        .from('cartoon_characters')
        .select('*');

      if (error) {
        console.error('❌ Error loading characters from database:', error);
        return;
      }

      console.log('📊 Raw characters data from database:', charactersData);

      if (charactersData && charactersData.length > 0) {
        console.log(`📝 Found ${charactersData.length} characters in database`);
        
        // Get public URLs for each character
        const charactersWithUrls = charactersData.map(character => {
          console.log(`🔗 Processing character: ${character.name}`);
          console.log(`📁 Storage path: ${character.storage_path}`);
          
          const { data } = supabase.storage
            .from('cartoon-characters')
            .getPublicUrl(character.storage_path);
          
          console.log(`🌐 Generated public URL for ${character.name}: ${data.publicUrl}`);
          
          return {
            ...character,
            image_url: data.publicUrl
          };
        });

        console.log('✅ Characters with URLs:', charactersWithUrls);
        setCharacters(charactersWithUrls);
        
        // Select a random character if none is selected
        if (!selectedCharacter && charactersWithUrls.length > 0) {
          const randomIndex = Math.floor(Math.random() * charactersWithUrls.length);
          const randomCharacter = charactersWithUrls[randomIndex];
          console.log(`🎲 Selected random character: ${randomCharacter.name}`);
          setSelectedCharacter(randomCharacter);
        }
      } else {
        console.log('⚠️ No characters found in database');
      }
    } catch (error) {
      console.error('💥 Error loading cartoon characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectRandomCharacter = () => {
    if (characters.length > 0) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      const randomCharacter = characters[randomIndex];
      console.log(`🎲 Manually selected random character: ${randomCharacter.name}`);
      setSelectedCharacter(randomCharacter);
    }
  };

  const uploadCharacterImages = async (files: { name: string; file: File }[]) => {
    console.log('📤 Starting character image upload process...');
    
    const uploadPromises = files.map(async ({ name, file }) => {
      const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}.png`;
      
      console.log(`📤 Uploading ${fileName} to cartoon-characters bucket...`);
      console.log(`📝 Character name: ${name}`);
      console.log(`📁 File name: ${fileName}`);
      
      const { error } = await supabase.storage
        .from('cartoon-characters')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error(`❌ Error uploading ${fileName}:`, error);
        return false;
      }
      
      console.log(`✅ Successfully uploaded ${fileName}`);
      return true;
    });

    const results = await Promise.all(uploadPromises);
    const allUploaded = results.every(result => result === true);
    
    console.log('📊 Upload results:', results);
    console.log(`🎯 All uploaded successfully: ${allUploaded}`);
    
    if (allUploaded) {
      console.log('🔄 Reloading characters after successful upload...');
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
