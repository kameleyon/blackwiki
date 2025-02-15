"use client";

import Link from "next/link";
import { FiEdit2 } from "react-icons/fi";

type EditButtonProps = {
  articleId: string;
}

export function EditButton({ articleId }: EditButtonProps) {
  return (
    <Link
      href={`/articles/edit/${articleId}`}
      className="text-gray-400 hover:text-gray-200 transition-colors"
    >
      <FiEdit2 size={20} />
    </Link>
  );
}
