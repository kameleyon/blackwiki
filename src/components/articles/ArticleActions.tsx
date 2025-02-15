"use client";

import { useRouter } from "next/navigation";
import { FiCheck, FiX } from "react-icons/fi";
import { useState } from "react";
import { SuccessModal } from "@/components/ui/SuccessModal";

type ArticleActionsProps = {
  articleId: string;
};

export function ArticleActions({ articleId }: ArticleActionsProps) {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`/api/articles/confirm/${articleId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit article");
      }

      const data = await response.json();
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
    }
  };

  const handleModalClose = () => {
    setShowSuccess(false);
  };

  return (
    <>
      {showSuccess && (
        <SuccessModal 
          message={successMessage} 
          onClose={handleModalClose} 
        />
      )}
    <form onSubmit={handleSubmit} className="flex flex-1 gap-4">
      <button
        type="submit"
        name="action"
        value="confirm"
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-900/50 text-green-100 rounded-md hover:bg-green-900/70"
      >
        <FiCheck size={20} />
        Confirm Submission
      </button>

      <button
        type="submit"
        name="action"
        value="cancel"
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-900/50 text-red-100 rounded-md hover:bg-red-900/70"
      >
        <FiX size={20} />
        Cancel
      </button>
    </form>
    </>
  );
}
