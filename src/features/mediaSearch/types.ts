import { z } from 'zod';

// TypeScript Types
export interface ImageResult {
  id: number;
  thumb: string;
  full: string;
  alt?: string;
  photographer: string;
  photographerUrl: string;
  pexelsUrl: string;
}

export interface VideoResult {
  id: string;
  title: string;
  channel: string;
  thumb: string;
  published: string;
  description: string;
  watchUrl: string;
  embedUrl: string;
}

export interface MediaSearchResponse {
  images: ImageResult[];
  videos: VideoResult[];
}

// Zod Schemas for Runtime Validation
export const ImageResultSchema = z.object({
  id: z.number(),
  thumb: z.string(),
  full: z.string(),
  alt: z.string().optional(),
  photographer: z.string(),
  photographerUrl: z.string(),
  pexelsUrl: z.string(),
});

export const VideoResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  channel: z.string(),
  thumb: z.string(),
  published: z.string(),
  description: z.string(),
  watchUrl: z.string(),
  embedUrl: z.string(),
});

export const MediaSearchResponseSchema = z.object({
  images: z.array(ImageResultSchema),
  videos: z.array(VideoResultSchema),
});
