"use client";

import React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Type definitions
type Article = {
  id: string;
  title: string;
  content: string;
  summary: string;
  authorId?: string;
  // Add other article fields as needed
};

// API fetch functions
async function fetchArticles() {
  const response = await fetch("/api/articles");
  if (!response.ok) {
    throw new Error("Failed to fetch articles");
  }
  return response.json();
}

async function fetchArticleById(id: string) {
  const response = await fetch(`/api/articles/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch article with id ${id}`);
  }
  return response.json();
}

async function fetchUserArticles(userId: string) {
  const response = await fetch(`/api/articles?authorId=${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user articles");
  }
  return response.json();
}

async function createArticle(articleData: Partial<Article>) {
  const response = await fetch("/api/articles/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(articleData),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create article");
  }
  
  return response.json();
}

async function updateArticle(id: string, articleData: Partial<Article>) {
  const response = await fetch(`/api/articles/update/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(articleData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update article with id ${id}`);
  }
  
  return response.json();
}

// React Query hooks
export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: fetchArticles,
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ["article", id],
    queryFn: () => fetchArticleById(id),
    enabled: !!id, // Only run if id is provided
  });
}

export function useUserArticles(userId: string) {
  return useQuery({
    queryKey: ["userArticles", userId],
    queryFn: () => fetchUserArticles(userId),
    enabled: !!userId, // Only run if userId is provided
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      // Invalidate articles queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Article> }) => 
      updateArticle(id, data),
    onSuccess: (data, variables) => {
      // Invalidate specific article query
      queryClient.invalidateQueries({ queryKey: ["article", variables.id] });
      // Invalidate articles list
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      // Invalidate user articles if we have the user ID
      if (data.authorId) {
        queryClient.invalidateQueries({ queryKey: ["userArticles", data.authorId] });
      }
    },
  });
}

// Example of a memoized component using React.memo
export function createMemoizedComponent<T>(Component: React.ComponentType<T>) {
  return React.memo(Component);
}
