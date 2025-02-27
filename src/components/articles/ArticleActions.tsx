"use client";

import { useRouter } from "next/navigation";
import { FiCheck, FiX, FiEdit } from "react-icons/fi";
import { useState } from "react";
import { SuccessModal } from "@/components/ui/SuccessModal";

type ArticleActionsProps = {
  articleId: string;
  factCheckStatus?: 'pass' | 'fail' | 'not-relevant';
};

export function ArticleActions({ articleId, factCheckStatus }: ArticleActionsProps) {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: 'confirm' | 'cancel') => {
    setIsLoading(true);

    try {
      // Clean markdown before submission
      if (action === 'confirm') {
        try {
          await fetch(`/api/articles/clean-markdown`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ articleId }),
          });
        } catch (error) {
          console.error("Error cleaning markdown:", error);
          // Continue with submission even if cleaning fails
        }
      }

      // Submit the article
      console.log("Submitting with action:", action);

      const response = await fetch(`/api/articles/confirm/${articleId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error("Error parsing response:", error);
        throw new Error("Failed to parse server response");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit article");
      }
      setSuccessMessage(data.message);
      setShowSuccess(true);

      // Router will be called by SuccessModal onClose
      if (data.redirect) {
        setTimeout(() => {
          router.push(data.redirect);
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting article:", error);
      setSuccessMessage(error instanceof Error ? error.message : "Failed to submit article");
      setShowSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccess(false);
  };

  const getFactCheckStatusDisplay = () => {
    if (!factCheckStatus) return null;

    switch (factCheckStatus) {
      case 'pass':
        return (
          <div className="mb-4 p-3 bg-white/10 border border-white/20 rounded-md flex items-center">
            <FiCheck size={20} className="text-white/70 mr-2" />
            <span className="text-white/70">This article has passed fact checking</span>
          </div>
        );
      case 'fail':
        return (
          <div className="mb-4 p-3 bg-white/10 border border-white/20 rounded-md flex items-center">
            <FiX size={20} className="text-white/70 mr-2" />
            <span className="text-white/70">This article contains factual errors that need correction</span>
          </div>
        );
      case 'not-relevant':
        return (
          <div className="mb-4 p-3 bg-white/10 border border-white/20 rounded-md flex items-center">
            <FiEdit size={20} className="text-white/70 mr-2" />
            <span className="text-white/70">This article may not align with AfroWiki&apos;s focus on Black history and culture</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {showSuccess && (
        <SuccessModal 
          message={successMessage} 
          onClose={handleModalClose} 
        />
      )}

      {getFactCheckStatusDisplay()}

      <div className="flex flex-1 gap-4">
        <button
          onClick={() => handleAction('confirm')}
          disabled={isLoading || factCheckStatus === 'fail'}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md
            ${factCheckStatus === 'fail' 
              ? 'bg-white/10 text-white/50 cursor-not-allowed' 
              : 'bg-white/20 text-white hover:bg-white/30'}`}
        >
          <FiCheck size={20} />
          {isLoading ? "Processing..." : "Confirm Submission"}
        </button>

        <button
          onClick={() => handleAction('cancel')}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white/80 rounded-md hover:bg-white/20"
        >
          <FiX size={20} />
          Cancel
        </button>
      </div>
    </>
  );
}
