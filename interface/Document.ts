export interface DocumentTree {
  title: string;
  type: 'category' | 'document';
  slug?: string;
  children: (string | DocumentTree)[];
  order: number;
  languages: string[];
}

export interface DocumentContent {
  metadata: {
    title: string;
    description: string;
    category: string;
    order: number;
    lastModified: string;
    language: string;
    path: string;
    slug: string;
  };
  html: string;
  toc: any[];
  markdown: string;
}
