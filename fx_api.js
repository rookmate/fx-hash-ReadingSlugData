const { GraphQLClient, gql } = require('graphql-request');

const collection = "magic-carpet";
const tokenID = 1258939;
let _output = {
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
  contractAddress: "",
  site: "fx(hash)",
  fromName: "",
  fromAddress: "",
  toName: "",
  toAddress: "",
  txHash: "",
  type: "listing",
  isPrivate: false,
  amount: 1,
}

async function tokenListing(tokenID) {
  const endpoint = 'https://api.fxhash.xyz/graphql'

  const graphQLClient = new GraphQLClient(endpoint)

  const tokenQuery = gql`
    query GenerativeToken($objktId: Float) {
      objkt(id: $objktId) {
        id
        slug
        name
        displayUri
        activeListing {
          price
        }
        rarity
        owner {
          name
        }
        features
      }
    }
  `

  const variables = {
    slug: collectionSlug,
    objktId: tokenID,
  }

  //const slugData = await graphQLClient.request(collectionQuery, variables)
  const tokenData = await graphQLClient.request(tokenQuery, variables)
  //console.log(JSON.stringify(tokenData, undefined, 2));
  _output = {
    price: Number.parseFloat(tokenData.objkt.activeListing.price / (10 ** 6)).toFixed(3),
    symbol: "XTZ",
    imageUrl: `https://gateway.fxhash.xyz/ipfs/${tokenData.objkt.displayUri.replace("ipfs://", "")}`,
    permalink: `https://www.fxhash.xyz/gentk/slug/${tokenData.objkt.slug}`,
    collectionName: tokenData.objkt.name,
    collectionSlug: tokenData.objkt.slug,
    tokenId: tokenData.objkt.id,
    rarity: tokenData.objkt.rarity,
    fromName: tokenData.objkt.owner.name,
    type: "listing",
    site: "fx(hash)",
    amount: tokenData.objkt.activeListing.amount || 1,
    traits: tokenData.objkt.features,
  }
  console.log(_output);
}

async function collectionActiveListings(collectionSlug) {
  const endpoint = 'https://api.fxhash.xyz/graphql'

  const graphQLClient = new GraphQLClient(endpoint)

  const collectionQuery = gql`
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

  const slugData = await graphQLClient.request(collectionQuery, variables)
  //console.log(JSON.stringify(slugData, undefined, 2));
  _output = {
    collectionName: slugData.generativeToken.name,
    collectionSlug: slugData.generativeToken.slug,
    type: "listing",
    site: "fx(hash)",
    price: Number.parseFloat(slugData.generativeToken.marketStats.floor / (10 ** 6)).toFixed(3),
    symbol: "XTZ",
  }
  console.log(_output);
}

async function trackCollection(collectionSlug) {
  const endpoint = 'https://api.fxhash.xyz/graphql'

  const graphQLClient = new GraphQLClient(endpoint)

  const collectionQuery = gql`
    query GenerativeToken($slug: String) {
      generativeToken(slug: $slug) {
        name
        slug
        id
        actions {
          id
          issuer {
            id
            name
          }
          type
          createdAt
          numericValue
          objkt {
            id
            slug
            name
            owner {
              id
              name
            }
          }
        }
      }
    }
  `
// Latest action is actions[0]
// type tells what happened:
//      MINTED_FROM
//      LISTING_V2
//      LISTING_V2_CANCELLED
//      OFFER_ACCEPTED
//      UPDATE_PRICING

  const variables = {
    slug: collectionSlug,
  }

  const slugData = await graphQLClient.request(collectionQuery, variables)
  console.log(JSON.stringify(slugData, undefined, 2));
}

async function trackToken(collectionSlug, tokenID) {
  const endpoint = 'https://api.fxhash.xyz/graphql'

  const graphQLClient = new GraphQLClient(endpoint)

  const collectionQuery = gql`
    query Objkt($objktId: Float) {
      objkt(id: $objktId) {
        id
        name
        slug
        actions {
          id
          type
          numericValue
          createdAt
          issuer {
            name
            id
          }
          target {
            id
            name
          }
        }
      }
    }
  `
// Latest action is actions[0]
// type tells what happened:
//      MINTED_FROM
//      LISTING_V2
//      LISTING_V2_CANCELLED
//      OFFER_ACCEPTED
//      UPDATE_PRICING

  const variables = {
    slug: collectionSlug,
    objktId: tokenID,
  }

  const slugData = await graphQLClient.request(collectionQuery, variables)
  console.log(JSON.stringify(slugData, undefined, 2));
}

//collectionActiveListings(collection).catch((error) => console.error(error));
//tokenListing(collection, tokenID).catch((error) => console.error(error));
//trackCollection(collection).catch((error) => console.error(error));
//trackToken(collection, tokenID).catch((error) => console.error(error));

