import { useState, useRef, useCallback } from "react";
import { useActions } from "@/hooks";

export function ImageUpload() {
  const { activePosition } = useActions();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setPreview(result);
          // Store in localStorage with position ID as key
          if (activePosition?.id) {
            localStorage.setItem(`custom_image_${activePosition.id}`, result);
          }
          setUploading(false);
          alert('Image saved! It will replace the position image for this position.');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      setUploading(false);
    }
  }, [activePosition]);

  const handleRemove = useCallback(() => {
    if (activePosition?.id) {
      localStorage.removeItem(`custom_image_${activePosition.id}`);
      setPreview(null);
      alert('Custom image removed');
    }
  }, [activePosition]);

  const getCustomImage = useCallback(() => {
    if (activePosition?.id) {
      return localStorage.getItem(`custom_image_${activePosition.id}`);
    }
    return null;
  }, [activePosition]);

  const customImage = getCustomImage();

  if (!activePosition?.id) {
    return null;
  }

  return (
    <div className="w-full neon-card rounded-md p-4 flex flex-col gap-3">
      <h4 className="text-lg neon-accent">Custom Position Image</h4>
      <div className="text-sm text-slate-300 mb-2">
        Upload your own image to replace position #{activePosition.id}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {(preview || customImage) && (
        <div className="mb-2">
          <img 
            src={preview || customImage || ''} 
            alt="Custom preview" 
            className="max-w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="neon-focus bg-pink-600 hover:bg-pink-700 duration-200 text-white rounded-lg px-4 py-2 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : '📷 Upload Image'}
        </button>
        {(preview || customImage) && (
          <button
            onClick={handleRemove}
            className="neon-focus bg-red-600 hover:bg-red-700 duration-200 text-white rounded-lg px-4 py-2"
          >
            🗑️ Remove
          </button>
        )}
      </div>
    </div>
  );
}

