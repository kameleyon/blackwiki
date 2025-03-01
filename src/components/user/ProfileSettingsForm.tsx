"use client";

import { useState, useRef } from "react";
import { FiSave, FiUpload, FiImage } from "react-icons/fi";
import Image from "next/image";

type ProfileSettingsFormProps = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    wecherp: string | null;
    expertise: string | null;
    interests: string | null;
    image: string | null;
  };
}

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    wecherp: user.wecherp || "",
    expertise: user.expertise || "",
    interests: user.interests || "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(user.image);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 5MB" });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "File must be an image" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setPreviewImage(data.imageUrl);
      setMessage({ type: "success", text: "Profile image updated successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to upload image. Please try again." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 rounded-xl p-6">
      <h2 className="text-xl font-normal text-gray-100">Profile Settings</h2>

      <div className="flex items-center gap-4">
        <div 
          onClick={handleImageClick}
          className="relative w-24 h-24 rounded-full bg-black/30 overflow-hidden cursor-pointer group"
        >
          {previewImage ? (
              <div className="relative w-full h-full">
                <Image 
                  src={previewImage || user.image || "/default-avatar.png"}
                  alt="Profile preview"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
              {formData.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <FiImage size={24} className="text-white" />
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={handleImageClick}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20"
          >
            <FiUpload size={20} />
            Upload Image
          </button>
          <p className="mt-1 text-sm text-gray-400">Max file size: 5MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
            Display Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-200 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="Tell us about yourself..."
          />
          <p className="mt-1 text-sm text-gray-400">Markdown formatting is supported.</p>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-200 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="City, Country"
          />
        </div>

        <div>
          <label htmlFor="expertise" className="block text-sm font-medium text-gray-200 mb-1">
            Areas of Expertise
          </label>
          <input
            type="text"
            id="expertise"
            name="expertise"
            value={formData.expertise}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="e.g., African History, Music, Art (comma separated)"
          />
        </div>

        <div>
          <label htmlFor="interests" className="block text-sm font-medium text-gray-200 mb-1">
            Interests
          </label>
          <input
            type="text"
            id="interests"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="e.g., Literature, Culture, Technology (comma separated)"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-200 mb-1">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label htmlFor="wecherp" className="block text-sm font-medium text-gray-200 mb-1">
            Wecherp Username
          </label>
          <input
            type="text"
            id="wecherp"
            name="wecherp"
            value={formData.wecherp}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="username (without @)"
          />
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md ${
            message.type === "success" ? "bg-green-900/50 text-green-200" : "bg-red-900/50 text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FiSave size={20} />
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
