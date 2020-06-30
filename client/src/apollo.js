// Apollo Client Setup
import {
    ApolloClient,
    HttpLink,
    InMemoryCache,
    split,
    gql,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/link-context";

// Apollo Subscriptions Setup
import { WebSocketLink } from "@apollo/link-ws";

// Wraps our requests with a token if one exists
// Copied from: https://www.apollographql.com/docs/react/v3.0-beta/networking/authentication/
const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = localStorage.getItem("token");
    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        },
    };
});

// HTTP Backend Link
const httpLink = new HttpLink({
    uri: "http://localhost:3000/graphql",
    //uri: "/graphql"
});

// WebSocket Backend Link
// const wsLink = new WebSocketLink({
//     // uri: `ws://localhost:3000/graphql`,
//     uri: process.env.REACT_APP_GRAPHQL_WS_URL,
//     options: {
//         reconnect: true
//     }
// });

// Uses wsLink for subscriptions, httpLink for queries & mutations (everything else)
// const splitLink = split(
//     ({ query }) => {
//         const definition = getMainDefinition(query);
//         return (
//             definition.kind === 'OperationDefinition' &&
//             definition.operation === 'subscription'
//         );
//     },
//     wsLink,
//     httpLink,
// );

// Setup cache
const cache = new InMemoryCache();

// Initialize Client
export const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
});

// Initial local state
const initialState = {
    service: process.env.REACT_APP_SERVICE_URL,
    recentUpdate: false,
    term: 202110,
};

// Initialize cache with a state
client.writeQuery({
    query: gql`
        query InitialState {
            service
            recentUpdate
            term
        }
    `,
    data: initialState,
});
