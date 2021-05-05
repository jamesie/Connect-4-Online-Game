import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Game = {
  __typename?: 'Game';
  id: Scalars['String'];
  gameBoard?: Maybe<Array<Array<Scalars['Int']>>>;
  whoseMove: Scalars['Float'];
  whoWon?: Maybe<Scalars['Float']>;
  messages: Array<Array<Scalars['String']>>;
  user1Id: Scalars['Int'];
  user2Id: Scalars['Int'];
  gameUUID: Scalars['String'];
  user1: User;
  user2?: Maybe<User>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createUser?: Maybe<User>;
  createGame?: Maybe<Game>;
  joinGame?: Maybe<Game>;
  movePiece: Game;
  sendMessage: Scalars['Boolean'];
};


export type MutationCreateUserArgs = {
  username: Scalars['String'];
};


export type MutationCreateGameArgs = {
  googleCaptchaToken: Scalars['String'];
};


export type MutationJoinGameArgs = {
  gameId: Scalars['String'];
};


export type MutationMovePieceArgs = {
  gameBoard: Array<Array<Scalars['Int']>>;
  gameId: Scalars['String'];
};


export type MutationSendMessageArgs = {
  message: Scalars['String'];
  gameUUID: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  ping: Scalars['String'];
  me?: Maybe<User>;
  fetchGameInfos?: Maybe<Game>;
};


export type QueryFetchGameInfosArgs = {
  gameId: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  gameSubscription: Game;
};


export type SubscriptionGameSubscriptionArgs = {
  gameId: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['Float'];
  nickname: Scalars['String'];
};

export type CreateGameMutationVariables = Exact<{
  googleCaptchaToken: Scalars['String'];
}>;


export type CreateGameMutation = (
  { __typename?: 'Mutation' }
  & { createGame?: Maybe<(
    { __typename?: 'Game' }
    & Pick<Game, 'id' | 'gameBoard' | 'whoseMove' | 'gameUUID'>
    & { user1: (
      { __typename?: 'User' }
      & Pick<User, 'id' | 'nickname'>
    ), user2?: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id' | 'nickname'>
    )> }
  )> }
);

export type CreateUserMutationVariables = Exact<{
  username: Scalars['String'];
}>;


export type CreateUserMutation = (
  { __typename?: 'Mutation' }
  & { createUser?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'nickname'>
  )> }
);

export type JoinGameMutationVariables = Exact<{
  gameId: Scalars['String'];
}>;


export type JoinGameMutation = (
  { __typename?: 'Mutation' }
  & { joinGame?: Maybe<(
    { __typename?: 'Game' }
    & Pick<Game, 'id' | 'gameUUID'>
  )> }
);

export type MovePieceMutationVariables = Exact<{
  gameBoard: Array<Array<Scalars['Int']> | Scalars['Int']> | Array<Scalars['Int']> | Scalars['Int'];
  gameId: Scalars['String'];
}>;


export type MovePieceMutation = (
  { __typename?: 'Mutation' }
  & { movePiece: (
    { __typename?: 'Game' }
    & Pick<Game, 'id' | 'gameBoard'>
  ) }
);

export type SendMessageMutationVariables = Exact<{
  message: Scalars['String'];
  gameUUID: Scalars['String'];
}>;


export type SendMessageMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'sendMessage'>
);

export type FetchGameInfosQueryVariables = Exact<{
  gameId: Scalars['String'];
}>;


export type FetchGameInfosQuery = (
  { __typename?: 'Query' }
  & { fetchGameInfos?: Maybe<(
    { __typename?: 'Game' }
    & Pick<Game, 'id' | 'whoWon' | 'whoseMove' | 'gameBoard' | 'messages' | 'gameUUID'>
    & { user1: (
      { __typename?: 'User' }
      & Pick<User, 'id' | 'nickname'>
    ), user2?: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id' | 'nickname'>
    )> }
  )> }
);

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'nickname'>
  )> }
);

export type GameSubscriptionSubscriptionVariables = Exact<{
  gameId: Scalars['String'];
}>;


export type GameSubscriptionSubscription = (
  { __typename?: 'Subscription' }
  & { gameSubscription: (
    { __typename?: 'Game' }
    & Pick<Game, 'id' | 'whoWon' | 'whoseMove' | 'gameBoard' | 'messages' | 'gameUUID'>
    & { user1: (
      { __typename?: 'User' }
      & Pick<User, 'id' | 'nickname'>
    ), user2?: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id' | 'nickname'>
    )> }
  ) }
);


export const CreateGameDocument = gql`
    mutation CreateGame($googleCaptchaToken: String!) {
  createGame(googleCaptchaToken: $googleCaptchaToken) {
    id
    user1 {
      id
      nickname
    }
    user2 {
      id
      nickname
    }
    gameBoard
    whoseMove
    gameUUID
  }
}
    `;
export type CreateGameMutationFn = Apollo.MutationFunction<CreateGameMutation, CreateGameMutationVariables>;

/**
 * __useCreateGameMutation__
 *
 * To run a mutation, you first call `useCreateGameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGameMutation, { data, loading, error }] = useCreateGameMutation({
 *   variables: {
 *      googleCaptchaToken: // value for 'googleCaptchaToken'
 *   },
 * });
 */
export function useCreateGameMutation(baseOptions?: Apollo.MutationHookOptions<CreateGameMutation, CreateGameMutationVariables>) {
        return Apollo.useMutation<CreateGameMutation, CreateGameMutationVariables>(CreateGameDocument, baseOptions);
      }
export type CreateGameMutationHookResult = ReturnType<typeof useCreateGameMutation>;
export type CreateGameMutationResult = Apollo.MutationResult<CreateGameMutation>;
export type CreateGameMutationOptions = Apollo.BaseMutationOptions<CreateGameMutation, CreateGameMutationVariables>;
export const CreateUserDocument = gql`
    mutation CreateUser($username: String!) {
  createUser(username: $username) {
    id
    nickname
  }
}
    `;
export type CreateUserMutationFn = Apollo.MutationFunction<CreateUserMutation, CreateUserMutationVariables>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      username: // value for 'username'
 *   },
 * });
 */
export function useCreateUserMutation(baseOptions?: Apollo.MutationHookOptions<CreateUserMutation, CreateUserMutationVariables>) {
        return Apollo.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, baseOptions);
      }
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<CreateUserMutation, CreateUserMutationVariables>;
export const JoinGameDocument = gql`
    mutation JoinGame($gameId: String!) {
  joinGame(gameId: $gameId) {
    id
    gameUUID
  }
}
    `;
export type JoinGameMutationFn = Apollo.MutationFunction<JoinGameMutation, JoinGameMutationVariables>;

/**
 * __useJoinGameMutation__
 *
 * To run a mutation, you first call `useJoinGameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinGameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinGameMutation, { data, loading, error }] = useJoinGameMutation({
 *   variables: {
 *      gameId: // value for 'gameId'
 *   },
 * });
 */
export function useJoinGameMutation(baseOptions?: Apollo.MutationHookOptions<JoinGameMutation, JoinGameMutationVariables>) {
        return Apollo.useMutation<JoinGameMutation, JoinGameMutationVariables>(JoinGameDocument, baseOptions);
      }
export type JoinGameMutationHookResult = ReturnType<typeof useJoinGameMutation>;
export type JoinGameMutationResult = Apollo.MutationResult<JoinGameMutation>;
export type JoinGameMutationOptions = Apollo.BaseMutationOptions<JoinGameMutation, JoinGameMutationVariables>;
export const MovePieceDocument = gql`
    mutation MovePiece($gameBoard: [[Int!]!]!, $gameId: String!) {
  movePiece(gameBoard: $gameBoard, gameId: $gameId) {
    id
    gameBoard
  }
}
    `;
export type MovePieceMutationFn = Apollo.MutationFunction<MovePieceMutation, MovePieceMutationVariables>;

/**
 * __useMovePieceMutation__
 *
 * To run a mutation, you first call `useMovePieceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMovePieceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [movePieceMutation, { data, loading, error }] = useMovePieceMutation({
 *   variables: {
 *      gameBoard: // value for 'gameBoard'
 *      gameId: // value for 'gameId'
 *   },
 * });
 */
export function useMovePieceMutation(baseOptions?: Apollo.MutationHookOptions<MovePieceMutation, MovePieceMutationVariables>) {
        return Apollo.useMutation<MovePieceMutation, MovePieceMutationVariables>(MovePieceDocument, baseOptions);
      }
export type MovePieceMutationHookResult = ReturnType<typeof useMovePieceMutation>;
export type MovePieceMutationResult = Apollo.MutationResult<MovePieceMutation>;
export type MovePieceMutationOptions = Apollo.BaseMutationOptions<MovePieceMutation, MovePieceMutationVariables>;
export const SendMessageDocument = gql`
    mutation SendMessage($message: String!, $gameUUID: String!) {
  sendMessage(message: $message, gameUUID: $gameUUID)
}
    `;
export type SendMessageMutationFn = Apollo.MutationFunction<SendMessageMutation, SendMessageMutationVariables>;

/**
 * __useSendMessageMutation__
 *
 * To run a mutation, you first call `useSendMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendMessageMutation, { data, loading, error }] = useSendMessageMutation({
 *   variables: {
 *      message: // value for 'message'
 *      gameUUID: // value for 'gameUUID'
 *   },
 * });
 */
export function useSendMessageMutation(baseOptions?: Apollo.MutationHookOptions<SendMessageMutation, SendMessageMutationVariables>) {
        return Apollo.useMutation<SendMessageMutation, SendMessageMutationVariables>(SendMessageDocument, baseOptions);
      }
export type SendMessageMutationHookResult = ReturnType<typeof useSendMessageMutation>;
export type SendMessageMutationResult = Apollo.MutationResult<SendMessageMutation>;
export type SendMessageMutationOptions = Apollo.BaseMutationOptions<SendMessageMutation, SendMessageMutationVariables>;
export const FetchGameInfosDocument = gql`
    query FetchGameInfos($gameId: String!) {
  fetchGameInfos(gameId: $gameId) {
    id
    user1 {
      id
      nickname
    }
    user2 {
      id
      nickname
    }
    whoWon
    whoseMove
    gameBoard
    messages
    gameUUID
  }
}
    `;

/**
 * __useFetchGameInfosQuery__
 *
 * To run a query within a React component, call `useFetchGameInfosQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchGameInfosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchGameInfosQuery({
 *   variables: {
 *      gameId: // value for 'gameId'
 *   },
 * });
 */
export function useFetchGameInfosQuery(baseOptions: Apollo.QueryHookOptions<FetchGameInfosQuery, FetchGameInfosQueryVariables>) {
        return Apollo.useQuery<FetchGameInfosQuery, FetchGameInfosQueryVariables>(FetchGameInfosDocument, baseOptions);
      }
export function useFetchGameInfosLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FetchGameInfosQuery, FetchGameInfosQueryVariables>) {
          return Apollo.useLazyQuery<FetchGameInfosQuery, FetchGameInfosQueryVariables>(FetchGameInfosDocument, baseOptions);
        }
export type FetchGameInfosQueryHookResult = ReturnType<typeof useFetchGameInfosQuery>;
export type FetchGameInfosLazyQueryHookResult = ReturnType<typeof useFetchGameInfosLazyQuery>;
export type FetchGameInfosQueryResult = Apollo.QueryResult<FetchGameInfosQuery, FetchGameInfosQueryVariables>;
export const MeDocument = gql`
    query Me {
  me {
    id
    nickname
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const GameSubscriptionDocument = gql`
    subscription GameSubscription($gameId: String!) {
  gameSubscription(gameId: $gameId) {
    id
    user1 {
      id
      nickname
    }
    user2 {
      id
      nickname
    }
    whoWon
    whoseMove
    gameBoard
    messages
    gameUUID
  }
}
    `;

/**
 * __useGameSubscriptionSubscription__
 *
 * To run a query within a React component, call `useGameSubscriptionSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGameSubscriptionSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGameSubscriptionSubscription({
 *   variables: {
 *      gameId: // value for 'gameId'
 *   },
 * });
 */
export function useGameSubscriptionSubscription(baseOptions: Apollo.SubscriptionHookOptions<GameSubscriptionSubscription, GameSubscriptionSubscriptionVariables>) {
        return Apollo.useSubscription<GameSubscriptionSubscription, GameSubscriptionSubscriptionVariables>(GameSubscriptionDocument, baseOptions);
      }
export type GameSubscriptionSubscriptionHookResult = ReturnType<typeof useGameSubscriptionSubscription>;
export type GameSubscriptionSubscriptionResult = Apollo.SubscriptionResult<GameSubscriptionSubscription>;