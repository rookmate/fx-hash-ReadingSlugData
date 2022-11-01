const { GraphQLClient, gql } = require('graphql-request');

const collection = "magic-carpet";
let _listings = {
  id: 0,
  price: 0.0,
  symbol: "xxx",
  imageUrl: "",
  permalink: "",
  collectionName: "",
  tokenId: 0,
  collectionSlug: "",
  rarity: 0,
  traits: [],
  //contractAddress,
  //site,
  fromName: "",
  //fromAddress,
  //toName,
  //toAddress,
  //txHash,
  type: "listing",
  //isPrivate,
  amount: 1,
}

async function activeListingsFromSlug(collectionSlug, _listings) {
  const endpoint = 'https://api.fxhash.xyz/graphql'

  const graphQLClient = new GraphQLClient(endpoint)

  const query = gql`
    query GenerativeToken($slug: String) {
      generativeToken(slug: $slug) {
        id
        slug
        name
        marketStats {
          floor
        }
        activeListedObjkts {
          id
          name
          slug
          displayUri
          rarity
          activeListing {
            amount
            price
          }
          owner {
            name
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
  //console.log(JSON.stringify(slugData, undefined, 2));
  _listings = {
    id: slugData.generativeToken.id,
    price: Number.parseFloat(slugData.generativeToken.activeListedObjkts[0].activeListing.price / (10 ** 6)).toFixed(3),
    symbol: "XTZ",
    imageUrl: `https://gateway.fxhash.xyz/ipfs/${slugData.generativeToken.activeListedObjkts[0].displayUri}`,
    permalink: `https://www.fxhash.xyz/gentk/slug/${slugData.generativeToken.activeListedObjkts[0].slug}`,
    collectionName: slugData.generativeToken.name,
    tokenId: slugData.generativeToken.activeListedObjkts[0].id,
    collectionSlug: slugData.generativeToken.slug,
    rarity: slugData.generativeToken.activeListedObjkts[0].rarity,
    traits: slugData.generativeToken.activeListedObjkts[0].features,
    fromName: slugData.generativeToken.activeListedObjkts[0].owner.name,
    type: "listing",
    amount: slugData.generativeToken.activeListedObjkts[0].activeListing.amount || 1,
  }
  console.log(_listings);
}

activeListingsFromSlug(collection, _listings).catch((error) => console.error(error));

// Query tested here: https://studio.apollographql.com/sandbox/explorer?endpoint=https%3A%2F%2Fapi.fxhash.xyz%2Fgraphql&explorerURLState=N4IgJg9gxgrgtgUwHYBcQC4QEcYIE4CeABAOLL4CGKAlgG4IAqEA1sgBQAkAzgDYwDm6IgGUUeakn4BKIsAA6SIkX7k8VOoxbteAodz7TZCpUuphjJnfwtKkFRDaJwKeVilFUuRxSaUAzHggIPEcAX0cKKBp6ABlqLhQEMAB5ACMAK2YUL3kfXzNHW3sEQqIrUrB4gAceCgIAVXFStXEUAlLI6IQ4hIl%2Bb19fKvEoErzB%2BwgYVFLw8aUIAHckfAHBood5ojn1vwQqGDwELjCLOdCQABoQWhdqClSeY4wQXKU5EHKMIg%2BVJABaAAeBAAXv8wBQuP9oLAeCgPpcFBdQkA
