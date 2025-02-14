"use client";
import { useRouter } from "next/navigation";
import UserNav from "@/components/user/UserNav";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function NewArticlePage() {
  const router = useRouter();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const categories = formData.get("categories") as string;
    const tags = formData.get("tags") as string;
    
    const articleData = { 
      title, 
      content, 
      categories, 
      tags, 
      imageUrl: uploadedImageUrl 
    };

    // Store article data in sessionStorage for the review page
    sessionStorage.setItem("newArticle", JSON.stringify(articleData));
    router.push("/articles/new/review");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold pl-4">Create New Article</h1>
      </div>
      {/* User Navigation Menu */}
      <UserNav currentPath="/articles/new" />
      {/* Article Creation Form */}
      <div className="mt-8 bg-neutral-200 dark:bg-neutral-800 rounded-xl shadow-sm shadow-black p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" encType="multipart/form-data">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              className="mt-1 block w-full rounded-md border border-neutral-300 bg-transparent text-neutral-900 dark:text-neutral-100 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Article Image
            </label>
            <input
              type="file"
              name="image"
              id="image"
              className="mt-1 block w-full text-neutral-900 dark:text-neutral-100"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const formData = new FormData();
                  formData.append('image', file);
                  
                  try {
                    const response = await fetch('/api/articles/upload-image', {
                      method: 'POST',
                      body: formData,
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      setUploadedImageUrl(data.imageUrl);
                    } else {
                      console.error('Failed to upload image');
                    }
                  } catch (error) {
                    console.error('Error uploading image:', error);
                  }
                }
              }}
            />
            {uploadedImageUrl && (
              <div className="mt-2">
                <img 
                  src={uploadedImageUrl} 
                  alt="Uploaded preview" 
                  className="max-h-40 object-contain"
                />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Content
            </label>
            <textarea
              name="content"
              id="content"
              rows={10}
              className="mt-1 block w-full rounded-md border border-neutral-300 bg-transparent text-neutral-900 dark:text-neutral-100 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="categories" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Categories
            </label>
            <input
              type="text"
              name="categories"
              id="categories"
              placeholder="Enter categories separated by commas"
              className="mt-1 block w-full rounded-md border border-neutral-300 bg-transparent text-neutral-900 dark:text-neutral-100 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              id="tags"
              placeholder="Enter tags separated by commas"
              className="mt-1 block w-full rounded-md border border-neutral-300 bg-transparent text-neutral-900 dark:text-neutral-100 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700"
            >
              Submit
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
