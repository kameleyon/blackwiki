"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiImage, FiUpload, FiPlus, FiMinus } from "react-icons/fi";
import Image from "next/image";

type NewArticleFormProps = {
  categories: {
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
    references?: string[];
    metadata?: {
      keywords?: string[];
      description?: string;
    };
  };
}

export function NewArticleForm({ categories, editMode = false, article }: NewArticleFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const articleFileInputRef = useRef<HTMLInputElement>(null);
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
    references: article?.references || [""],
    metadata: {
      keywords: article?.metadata?.keywords || [],
      description: article?.metadata?.description || "",
    }
  });
  const [useAI, setUseAI] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleArticleFileClick = () => {
    articleFileInputRef.current?.click();
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
    } catch {
      setMessage({ type: "error", text: "Failed to upload image. Please try again." });
    }
  };

  const handleArticleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "File size must be less than 10MB" });
      return;
    }

    // Validate file type (text files only)
    const validTypes = ['text/plain', 'text/markdown', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      setMessage({ type: "error", text: "File must be a text document (.txt, .md, .doc, .docx)" });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const content = event.target.result.toString();
          setFormData(prev => ({
            ...prev,
            content: content,
            title: prev.title || file.name.replace(/\.[^/.]+$/, "") // Use filename as title if empty
          }));
          setMessage({ type: "success", text: "File content loaded successfully!" });
        }
      };
      reader.readAsText(file);
    } catch {
      setMessage({ type: "error", text: "Failed to read file. Please try again." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Extract keywords from content for SEO if not provided
    if (formData.metadata.keywords.length === 0) {
      const keywords = extractKeywords(formData.content, formData.tags);
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          keywords
        }
      }));
    }

    // Use summary as metadata description if not provided
    if (!formData.metadata.description && formData.summary) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          description: formData.summary
        }
      }));
    }

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
          enhanceWithAI: useAI
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
    } catch {
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

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(",").map(keyword => keyword.trim());
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        keywords
      }
    }));
  };

  const handleReferenceChange = (index: number, value: string) => {
    const updatedReferences = [...formData.references];
    updatedReferences[index] = value;
    setFormData(prev => ({ ...prev, references: updatedReferences }));
  };

  const addReference = () => {
    setFormData(prev => ({ 
      ...prev, 
      references: [...prev.references, ""] 
    }));
  };

  const removeReference = (index: number) => {
    if (formData.references.length > 1) {
      const updatedReferences = [...formData.references];
      updatedReferences.splice(index, 1);
      setFormData(prev => ({ ...prev, references: updatedReferences }));
    }
  };

  // Extract keywords from content and tags
  const extractKeywords = (content: string, tags: string[]): string[] => {
    // Start with the tags as keywords
    const keywords = new Set(tags);
    
    // Extract common words from content (excluding stop words)
    const stopWords = new Set(['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    // Count word frequency
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    // Get top 10 most frequent words
    const topWords = Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
    
    // Add top words to keywords
    topWords.forEach(word => keywords.add(word));
    
    return Array.from(keywords).slice(0, 15); // Limit to 15 keywords
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
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="content" className="block text-sm font-medium text-gray-200">
              Content
            </label>
            <button
              type="button"
              onClick={handleArticleFileClick}
              className="flex items-center text-sm text-gray-400 hover:text-white"
            >
              <FiUpload size={14} className="mr-1" />
              Upload File
            </button>
          </div>
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
          <input
            ref={articleFileInputRef}
            type="file"
            accept=".txt,.md,.doc,.docx,text/plain,text/markdown,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleArticleFileChange}
            className="hidden"
          />
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
              <div className="relative w-full h-full">
                <Image 
                  src={previewImage} 
                  alt="Article preview" 
                  fill
                  className="object-cover"
                />
              </div>
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

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            References
          </label>
          <div className="space-y-2">
            {formData.references.map((reference, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => handleReferenceChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="Book, article, website URL, etc."
                />
                <button
                  type="button"
                  onClick={() => removeReference(index)}
                  className="p-2 text-gray-400 hover:text-white"
                  disabled={formData.references.length <= 1}
                >
                  <FiMinus size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addReference}
              className="flex items-center text-sm text-gray-400 hover:text-white"
            >
              <FiPlus size={14} className="mr-1" />
              Add Reference
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <h3 className="text-sm font-medium text-gray-200 mb-3">SEO Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-200 mb-1">
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                value={formData.metadata.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    description: e.target.value
                  }
                }))}
                rows={2}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Description for search engines (defaults to summary if left empty)"
              />
              <p className="mt-1 text-xs text-gray-400">Recommended length: 150-160 characters</p>
            </div>
            
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-200 mb-1">
                Keywords
              </label>
              <input
                type="text"
                id="keywords"
                value={formData.metadata.keywords.join(", ")}
                onChange={handleKeywordsChange}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Keywords for search engines (comma separated)"
              />
              <p className="mt-1 text-xs text-gray-400">Will be auto-generated from content if left empty</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="bg-black/20 rounded-lg p-4 border border-white/10 flex items-center">
            <div className="flex-shrink-0 mr-4">
              <input
                id="enhance-ai"
                type="checkbox"
                checked={useAI}
                onChange={() => setUseAI(!useAI)}
                className="h-5 w-5 rounded border-white/20 bg-black/30 text-white focus:ring-2 focus:ring-white/30 focus:ring-offset-0"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="enhance-ai" className="text-base font-medium text-white">
                Enhance article with AI before review
              </label>
              <p className="mt-1 text-sm text-white/70">
                Our AI will improve formatting, fix grammar issues, and suggest improvements to your article
              </p>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md bg-white/10 text-white/80`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-white/10 text-white/80 rounded-md hover:bg-white/20"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 bg-white/10 text-white/80 rounded-md hover:bg-white/20 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (editMode ? "Saving..." : "Creating...") : (editMode ? "Save Changes" : "Create Article")}
        </button>
      </div>
    </form>
  );
}
