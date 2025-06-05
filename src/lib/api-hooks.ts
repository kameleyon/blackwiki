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

// --- Status API ---
async function fetchArticleStatus(slug: string) {
  const response = await fetch(`/api/articles/${slug}/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch status for article ${slug}`);
  }
  return response.json() as Promise<{ status: string }>;
}

async function updateArticleStatus(slug: string, status: string) {
  const response = await fetch(`/api/articles/${slug}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update status for article ${slug}: ${errorText}`);
  }
  return response.json();
}

// --- Review API ---
async function fetchArticleReviews(slug: string) {
  const response = await fetch(`/api/articles/${slug}/reviews`);
  if (!response.ok) {
    throw new Error(`Failed to fetch reviews for article ${slug}`);
  }
  // TODO: Define a proper type for ReviewWithRelations
  return response.json() as Promise<any[]>;
}

async function assignReview(slug: string, data: { reviewerId: string; assigneeId: string; type: string; metadata?: string; checklist?: string }) {
  const response = await fetch(`/api/articles/${slug}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
     const errorText = await response.text();
    throw new Error(`Failed to assign review for article ${slug}: ${errorText}`);
  }
  return response.json();
}

async function fetchReviewDetails(reviewId: string) {
  const response = await fetch(`/api/reviews/${reviewId}`);
   if (!response.ok) {
    throw new Error(`Failed to fetch review details for ${reviewId}`);
  }
  // TODO: Define a proper type for ReviewDetails
  return response.json() as Promise<any>;
}

async function updateReview(reviewId: string, data: { status?: string; feedback?: string; score?: number; checklist?: string; metadata?: string }) {
   const response = await fetch(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
     const errorText = await response.text();
    throw new Error(`Failed to update review ${reviewId}: ${errorText}`);
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

// --- Status Hooks ---
export function useArticleStatus(slug: string) {
  return useQuery({
    queryKey: ['articleStatus', slug],
    queryFn: () => fetchArticleStatus(slug),
    enabled: !!slug,
  });
}

export function useUpdateArticleStatus(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => updateArticleStatus(slug, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articleStatus', slug] });
      // Potentially invalidate article details if status affects display
      // queryClient.invalidateQueries({ queryKey: ['article', slug] }); // Assuming article query uses slug
    },
    // Add onError for feedback
  });
}

// --- Review Hooks ---
export function useArticleReviews(slug: string) {
  return useQuery({
    queryKey: ['articleReviews', slug],
    queryFn: () => fetchArticleReviews(slug),
    enabled: !!slug,
  });
}

export function useAssignReview(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { reviewerId: string; assigneeId: string; type: string; metadata?: string; checklist?: string }) => assignReview(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articleReviews', slug] });
      // Potentially update article status or review state query
    },
     // Add onError for feedback
  });
}

export function useReviewDetails(reviewId: string) {
   return useQuery({
    queryKey: ['reviewDetails', reviewId],
    queryFn: () => fetchReviewDetails(reviewId),
    enabled: !!reviewId,
  });
}

export function useUpdateReview(reviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { status?: string; feedback?: string; score?: number; checklist?: string; metadata?: string }) => updateReview(reviewId, data),
    onSuccess: (updatedReview) => {
      queryClient.invalidateQueries({ queryKey: ['reviewDetails', reviewId] });
      // Invalidate the list of reviews for the article
      // Need article slug - might need to fetch it first or pass it somehow
      // queryClient.invalidateQueries({ queryKey: ['articleReviews', articleSlug] });
      // Potentially update article status or review state query
    },
     // Add onError for feedback
  });
}


// Example of a memoized component using React.memo
export function createMemoizedComponent<T>(Component: React.ComponentType<T>) {
  return React.memo(Component);
}
