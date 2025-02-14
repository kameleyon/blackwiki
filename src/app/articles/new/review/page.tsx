"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { FiCheckCircle } from "react-icons/fi";

export default function ReviewArticlePage() {
  const router = useRouter();
  const [articleData, setArticleData] = useState<any>(null);
  const [factCheckResult, setFactCheckResult] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem("newArticle");
    if (storedData) {
      setArticleData(JSON.parse(storedData));
    } else {
      router.push("/articles/new");
    }
  }, [router]);

  const handleFactCheck = async () => {
    if (!articleData) return;
    setIsChecking(true);
    try {
      // Call the fact-checking API using openrouter.ai and model perplexity/llama-3.1-sonar-small-128k-online.
      const response = await fetch("/api/articles/fact-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: articleData.content }),
      });
      const data = await response.json();
      setFactCheckResult(data.result || "No discrepancies found.");
    } catch (error) {
      setFactCheckResult("Error during fact-checking.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleConfirm = async () => {
    if (!articleData) return;
    try {
      // Create article with the stored image URL
      const articlePayload = {
        title: articleData.title,
        content: articleData.content,
        categories: articleData.categories,
        tags: articleData.tags,
        imageUrl: articleData.imageUrl || null
      };

      const response = await fetch("/api/articles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articlePayload),
      });
      if (response.ok) {
        sessionStorage.removeItem("newArticle");
        router.push("/dashboard");
      } else {
        alert("Failed to create article.");
      }
    } catch (error) {
      alert("Error while saving article.");
    }
  };

  if (!articleData) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Review Your Article</h1>
      <div className="mb-6">
        <h2 className="text-xl font-bold">{articleData.title}</h2>
        {articleData.imageUrl && (
          <img src={articleData.imageUrl} alt="Article" className="my-4 max-h-60 object-contain" />
        )}
        <div className="prose dark:prose-dark mt-4">
          <ReactMarkdown>{articleData.content}</ReactMarkdown>
        </div>
        {articleData.categories && (
          <div className="mt-4">
            <strong>Categories:</strong> {articleData.categories}
          </div>
        )}
        {articleData.tags && (
          <div className="mt-2">
            <strong>Tags:</strong> {articleData.tags}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleFactCheck}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700"
        >
          <FiCheckCircle size={20} />
          {isChecking ? "Fact Checking..." : "Fact Check"}
        </button>
        {factCheckResult && (
          <div className="text-sm text-green-600">
            Fact Check Result: {factCheckResult}
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/articles/new")}
          className="px-4 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700"
        >
          Go Back to Edit
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700"
        >
          Confirm & Save
        </button>
      </div>
    </div>
  );
}
