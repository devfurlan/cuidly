export interface BlogPost {
  databaseId: number;
  dateGmt: string;
  modifiedGmt: string;
  status: string;
  title: string;
  slug: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
    };
  };
  excerpt: string;
  content: string;
  author?: {
    node: {
      avatar: {
        url: string;
      };
      databaseId: number;
      firstName: string;
      lastName: string;
      slug: string;
    };
  };
  tags?: {
    nodes: {
      databaseId: number;
      name: string;
      slug: string;
    }[];
  };
  categories?: {
    nodes: {
      databaseId: number;
      name: string;
      slug: string;
    }[];
  };
}

export type BlogPosts = BlogPost[];
