"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function NewArticlePage() {
  const { status } = useSession();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    categories: "",
    tags: "",
    image: "",
    imageAlt: "",
    imageWidth: 0,
    imageHeight: 0,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/articles/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      setFormData(prev => ({
        ...prev,
        image: data.image,
        imageWidth: data.width,
        imageHeight: data.height,
      }));
      setImagePreview(data.image);
    } catch (error) {
      console.error("Error uploading image:", error);
      // TODO: Add error notification
    } finally {
      setIsUploading(false);
    }
  };
  const [factCheckResult, setFactCheckResult] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleFactCheck = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/articles/fact-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check facts');
      }

      setFactCheckResult(data.analysis);
    } catch (error) {
      console.error('Error checking facts:', error);
      setFactCheckResult('Error performing fact check. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/articles/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create article');
      }

      // Redirect to the new article
      window.location.href = `/articles/${data.article.slug}`;
    } catch (error) {
      console.error('Error creating article:', error);
      // TODO: Add error notification
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white/5 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Please sign in to create articles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Create New Article</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-secondary/10 rounded-lg focus:ring-2 focus:ring-primary/20"
              placeholder="Enter article title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Summary</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-4 py-2 bg-secondary/10 rounded-lg focus:ring-2 focus:ring-primary/20 h-24"
              placeholder="Brief summary of the article..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 bg-secondary/10 rounded-lg focus:ring-2 focus:ring-primary/20 h-96"
              placeholder="Write your article content here..."
              style={{ lineHeight: '1.7' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Article Image</label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <label 
                  htmlFor="article-image"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Article preview"
                      width={200}
                      height={200}
                      className="h-full w-full object-contain rounded-lg"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-white/70" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-white/70">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-white/70">PNG, JPG or GIF (MAX. 800x800px)</p>
                    </div>
                  )}
                </label>
                <input
                  type="file"
                  id="article-image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </div>
              {imagePreview && (
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.imageAlt}
                    onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary/10 rounded-lg focus:ring-2 focus:ring-primary/20"
                    placeholder="Image description (alt text)"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Categories</label>
              <input
                type="text"
                value={formData.categories}
                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                className="w-full px-4 py-2 bg-secondary/10 rounded-lg focus:ring-2 focus:ring-primary/20"
                placeholder="e.g., History, Culture (comma separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 bg-secondary/10 rounded-lg focus:ring-2 focus:ring-primary/20"
                placeholder="e.g., Africa, Diaspora (comma separated)"
              />
            </div>
          </div>

          {factCheckResult && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Fact Check Results</h3>
              <div className="whitespace-pre-wrap" style={{ lineHeight: '1.7' }}>
                {factCheckResult}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleFactCheck}
              disabled={isChecking || !formData.title || !formData.content}
              className="px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors disabled:opacity-50"
            >
              {isChecking ? "Checking Facts..." : "Check Facts"}
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
            >
              Create Article
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
