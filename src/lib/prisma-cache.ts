import { prisma } from "@/lib/db";
import { getCachedData, setCachedData } from "@/lib/redis";

// Define types for query options
interface QueryOptions {
  skip?: number;
  take?: number;
  where?: Record<string, unknown>;
  orderBy?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, unknown>;
}

/**
 * Cached Prisma query for articles
 * @param options Query options
 * @returns Articles with caching
 */
export async function getCachedArticles(options: QueryOptions) {
  const { skip, take, where, orderBy, include, select } = options;
  
  // Create a cache key based on the query parameters
  const cacheKey = `articles:${JSON.stringify({ skip, take, where, orderBy, include, select })}`;
  
  // Try to get from cache first
  const cachedData = await getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // If not in cache, fetch from database
  const articles = await prisma.article.findMany({
    skip,
    take,
    where,
    orderBy,
    include,
    select,
  });
  
  // Cache the result for 5 minutes (300 seconds)
  await setCachedData(cacheKey, articles, 300);
  
  return articles;
}

/**
 * Cached Prisma query for a single article
 * @param id Article ID
 * @param options Query options
 * @returns Article with caching
 */
export async function getCachedArticleById(
  id: string,
  options: {
    include?: Record<string, unknown>;
    select?: Record<string, unknown>;
  } = {}
) {
  const { include, select } = options;
  
  // Create a cache key based on the article ID and query parameters
  const cacheKey = `article:${id}:${JSON.stringify({ include, select })}`;
  
  // Try to get from cache first
  const cachedData = await getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // If not in cache, fetch from database
  const article = await prisma.article.findUnique({
    where: { id },
    include,
    select,
  });
  
  // Cache the result for 5 minutes (300 seconds)
  if (article) {
    await setCachedData(cacheKey, article, 300);
  }
  
  return article;
}

/**
 * Cached Prisma query for user articles
 * @param userId User ID
 * @param options Query options
 * @returns User articles with caching
 */
export async function getCachedUserArticles(
  userId: string,
  options: QueryOptions = {}
) {
  const { skip, take, where = {}, orderBy, include, select } = options;
  
  // Add user ID to where clause
  const fullWhere = { ...where, authorId: userId };
  
  // Create a cache key based on the query parameters
  const cacheKey = `user:${userId}:articles:${JSON.stringify({
    skip,
    take,
    where: fullWhere,
    orderBy,
    include,
    select,
  })}`;
  
  // Try to get from cache first
  const cachedData = await getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // If not in cache, fetch from database
  const articles = await prisma.article.findMany({
    skip,
    take,
    where: fullWhere,
    orderBy,
    include,
    select,
  });
  
  // Cache the result for 5 minutes (300 seconds)
  await setCachedData(cacheKey, articles, 300);
  
  return articles;
}

/**
 * Cached Prisma query for categories
 * @returns Categories with caching
 */
export async function getCachedCategories() {
  const cacheKey = 'categories';
  
  // Try to get from cache first
  const cachedData = await getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // If not in cache, fetch from database
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  
  // Cache the result for 1 hour (3600 seconds) since categories don't change often
  await setCachedData(cacheKey, categories, 3600);
  
  return categories;
}

/**
 * Cached Prisma query for tags
 * @returns Tags with caching
 */
export async function getCachedTags() {
  const cacheKey = 'tags';
  
  // Try to get from cache first
  const cachedData = await getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // If not in cache, fetch from database
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  });
  
  // Cache the result for 1 hour (3600 seconds) since tags don't change often
  await setCachedData(cacheKey, tags, 3600);
  
  return tags;
}
