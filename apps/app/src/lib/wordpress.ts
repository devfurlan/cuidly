import { BlogPost, BlogPosts } from '@/app/(public)/(shell)/blog/types';
import { getApolloClient } from '@/lib/api-clients/apollo';
import { gql } from '@apollo/client';

const POSTS_PER_PAGE = parseInt(
  process.env.NEXT_PUBLIC_WORDPRESS_POSTS_PER_PAGE || '10',
);

export async function getPaginatedPosts(
  page = 1,
  perPage = POSTS_PER_PAGE,
): Promise<{
  posts: BlogPosts;
  totalPages: number;
}> {
  const offset = (page - 1) * perPage;

  // Busca total de posts
  const totalQuery = await getApolloClient().query({
    query: gql`
      query {
        posts {
          pageInfo {
            hasNextPage
          }
          nodes {
            databaseId
          }
        }
      }
    `,
  });
  const total = totalQuery.data.posts.nodes.length;
  const totalPages = Math.ceil(total / perPage);

  // Busca posts atuais
  const { data } = await getApolloClient().query({
    query: gql`
      query GetPosts($first: Int!, $after: String) {
        posts(first: $first, after: $after) {
          nodes {
            databaseId
            dateGmt
            title
            slug
            featuredImage {
              node {
                sourceUrl
              }
            }
            excerpt(format: RENDERED)
          }
        }
      }
    `,
    variables: {
      first: perPage,
      after: offset > 0 ? btoa(`arrayconnection:${offset - 1}`) : undefined,
    },
  });

  return {
    posts: data.posts.nodes,
    totalPages,
  };
}

export async function getPostBySlug(slug: string): Promise<BlogPost> {
  try {
    const { data } = await getApolloClient().query({
      query: gql`
        query GetPostBySlug($slug: String!) {
          postBy(slug: $slug) {
            databaseId
            dateGmt
            modifiedGmt
            status
            title
            slug
            featuredImage {
              node {
                sourceUrl
              }
            }
            excerpt(format: RENDERED)
            content(format: RENDERED)
            author {
              node {
                avatar {
                  url
                }
                databaseId
                firstName
                lastName
                slug
              }
            }
            tags {
              nodes {
                databaseId
                name
                slug
              }
            }
            categories {
              nodes {
                databaseId
                name
                slug
              }
            }
          }
        }
      `,
      variables: { slug },
    });

    return data.postBy;
  } catch (error) {
    console.error('Error fetching WP getPostBySlug (GraphQL):', error);
    throw new Error('Failed to fetch WP getPostBySlug.');
  }
}

export async function getRelatedPosts(currentId: number, limit = 4) {
  try {
    const { data } = await getApolloClient().query({
      query: gql`
        query GetAllPosts {
          posts(first: ${limit}) {
            nodes {
              id
              title
              slug
              excerpt
              date
              featuredImage {
                node {
                  sourceUrl
                }
              }
            }
          }
        }
      `,
    });

    const allPosts = data.posts.nodes;
    const relatedPosts = allPosts
      .filter((p: any) => p.id !== currentId)
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    return relatedPosts;
  } catch (error) {
    console.error('Error fetching WP getRelatedPosts (GraphQL):', error);
    throw new Error('Failed to fetch WP getRelatedPosts.');
  }
}

export async function getLatestPosts(limit = 5): Promise<BlogPosts> {
  const { data } = await getApolloClient().query({
    query: gql`
      query {
        posts(first: ${limit}) {
          nodes {
            dateGmt
            title
            slug
            featuredImage {
              node {
                sourceUrl
              }
            }
            excerpt(format: RENDERED)
          }
        }
      }
    `,
  });

  return data.posts.nodes;
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const { data } = await getApolloClient().query({
      query: gql`
        query GetAllPostSlugs {
          posts(first: 1000) {
            nodes {
              slug
            }
          }
        }
      `,
    });

    return data.posts.nodes.map((post: { slug: string }) => post.slug);
  } catch (error) {
    console.error('Error fetching all post slugs:', error);
    return [];
  }
}
