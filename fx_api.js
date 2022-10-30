const { GraphQLClient, gql } = require('graphql-request');

async function activeListingsFromSlug(collectionSlug) {
  const endpoint = 'https://api.fxhash.xyz/graphql'

  const graphQLClient = new GraphQLClient(endpoint)

  const query = gql`
    query GenerativeToken($slug: String) {
      generativeToken(slug: $slug) {
        slug
        marketStats {
          floor
        }
        activeListedObjkts {
          id
          name
          slug
          thumbnailUri
          displayUri
          metadataUri
          activeListing {
            price
          }
          features
        }
      }
    }
  `

  const variables = {
    slug: collectionSlug,
  }

  const slugData = await graphQLClient.request(query, variables)
  console.log(JSON.stringify(slugData, undefined, 2))
}

const collection = "magic-carpet";
activeListingsFromSlug(collection).catch((error) => console.error(error))
// FYI decimal point has 6 digits

// Query tested here: https://studio.apollographql.com/sandbox/explorer?endpoint=https%3A%2F%2Fapi.fxhash.xyz%2Fgraphql&explorerURLState=N4IgJg9gxgrgtgUwHYBcQC4QEcYIE4CeABAOLL4CGKAlgG4IAqEA1sgBQAkAzgDYwDm6IgGUUeakn4BKIsAA6SIkX7k8VOoxbteAodz7TZCpUp39jJuBTysUoqlyOKTSgGY8IEPBaUBfH0QUUDT0ADLUXCgIYADyAEYAVswojvLOLtRgAUpIFIjZRGYFKAAW8HG51DwAquIFYBEADjwUBLXUBYgoFGBUFO0FQSEI4ZES-E4uLo3iUAgF-ukmrghUMHgIXAGLfgq%2BIAA0ILTW1BRxPJsYIGlKciBFGET3KkgAtAAeBABeb71cb2gsB4KHuBz2IF8QA
