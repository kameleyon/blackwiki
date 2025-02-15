"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiUpload, FiImage } from "react-icons/fi";

type NewArticleFormProps = {
  categories: {
    id: string;
    name: string;
  }[];
  existingTags: {
    id: string;
    name: string;
  }[];
  editMode?: boolean;
  article?: {
    id: string;
    title: string;
    content: string;
    summary: string;
    image?: string | null;
    imageAlt?: string | null;
    categories: string[];
    tags: string[];
  };
}

export function NewArticleForm({ categories, existingTags, editMode = false, article }: NewArticleFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(article?.image || null);
  const [formData, setFormData] = useState({
    title: article?.title || "",
    summary: article?.summary || "",
    content: article?.content || "",
    categories: article?.categories || [],
    tags: article?.tags || [],
    imageAlt: article?.imageAlt || "",
  });

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

      const response = await fetch("/api/articles/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setPreviewImage(data.imageUrl);
      setMessage({ type: "success", text: "Image uploaded successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to upload image. Please try again." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const endpoint = editMode 
        ? `/api/articles/update/${article?.id}`
        : "/api/articles/create";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: previewImage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create article");
      }

      const data = await response.json();
      if (editMode) {
        router.push(`/articles/new/review/${article?.id}`);
      } else {
        router.push(`/articles/new/review/${data.articleId}`);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create article. Please try again." });
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({ ...prev, categories: selectedOptions }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map(tag => tag.trim());
    setFormData(prev => ({ ...prev, tags }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 rounded-xl p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="Enter article title..."
          />
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-200 mb-1">
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="Brief summary of the article..."
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-200 mb-1">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={12}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="Write your article content here..."
          />
          <p className="mt-1 text-sm text-gray-400">Markdown formatting is supported.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Article Image
          </label>
          <div 
            onClick={handleImageClick}
            className="relative w-full h-64 border-2 border-dashed border-white/10 rounded-lg overflow-hidden cursor-pointer hover:border-white/20 transition-colors"
          >
            {previewImage ? (
              <img 
                src={previewImage} 
                alt="Article preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <FiImage size={48} className="mb-2" />
                <p>Click to upload or drag and drop</p>
                <p className="text-sm">PNG, JPG or GIF (MAX. 800x800px)</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          {previewImage && (
            <div className="mt-2">
              <label htmlFor="imageAlt" className="block text-sm font-medium text-gray-200 mb-1">
                Image Alt Text
              </label>
              <input
                type="text"
                id="imageAlt"
                name="imageAlt"
                value={formData.imageAlt}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Describe the image..."
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="categories" className="block text-sm font-medium text-gray-200 mb-1">
            Categories
          </label>
          <select
            id="categories"
            name="categories"
            multiple
            value={formData.categories}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-400">Hold Ctrl/Cmd to select multiple categories</p>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-200 mb-1">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags.join(", ")}
            onChange={handleTagsChange}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="e.g., History, Culture, Art (comma separated)"
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

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-white/5 text-white rounded-md hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (editMode ? "Saving..." : "Creating...") : (editMode ? "Save Changes" : "Create Article")}
        </button>
      </div>
    </form>
  );
}
