import { ApolloClient, InMemoryCache } from '@apollo/client';

export function getApolloClient() {
  return new ApolloClient({
    uri: `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL || ''}/graphql`,
    cache: new InMemoryCache(),
  });
}
