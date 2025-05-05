"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userService } from "@/services/user";
import { toast } from "react-hot-toast";

interface ProfilePictureUploadProps {
  currentImage?: string;
  name?: string;
  onUploadSuccess: (imageUrl: string) => void;
}

export function ProfilePictureUpload({
  currentImage,
  name,
  onUploadSuccess,
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.length) {
      toast.error("Please select an image to upload");
      return;
    }

    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      setIsUploading(true);
      const response = await userService.updateProfilePicture(formData);
      
      if (response.profilePicture) {
        onUploadSuccess(response.profilePicture);
        toast.success("Profile picture updated successfully");
      } else {
        toast.error("Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const cancelUpload = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-orange-200">
          <AvatarImage 
            src={previewImage || currentImage} 
            alt={name || "Profile"} 
          />
          <AvatarFallback className="bg-orange-100 text-orange-600 text-xl">
            {name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {previewImage && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={isUploading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isUploading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={cancelUpload}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
