export type BlogCategory =
  | "Physics"
  | "Chemistry"
  | "Mathematics"
  | "Biology";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  tags: string[];
  published: boolean;
  author: string;
  readingTime: number;
  createdAt: any;
  publishedAt: any | null;
}
