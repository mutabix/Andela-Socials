import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink } from 'apollo-link';

const cache = new InMemoryCache();
const httpLink = new HttpLink({
    uri: process.env.API_URI
});

const middlewareAuthLink = new ApolloLink((operation, forward) => {
    const token = "token"
    const authorizationHeader = token ? token : null
    operation.setContext({
        headers:{
            authorization: authorizationHeader
        }
    })
})

const httpLinkWithAuthToken = middlewareAuthLink.concat(httpLink)

const Client = new ApolloClient({
    link: httpLinkWithAuthToken,
    cache: cache
})

export default Client;