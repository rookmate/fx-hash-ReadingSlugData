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

// gets the active listing on a token as well as "all" the token details
// with traits included
async function tokenListing(collectionSlug, tokenID) {
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

// gets all active listings for a collection
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

// tracks all activity on a collection:
// MINTED_FROM,
// LISTING_V2,
// LISTING_V2_CANCELLED,
// OFFER_ACCEPTED,
// UPDATE_PRICING
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

// tracks all activity on a token:
// MINTED_FROM,
// LISTING_V2,
// LISTING_V2_CANCELLED,
// OFFER_ACCEPTED,
// UPDATE_PRICING
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

// Default query behavior is different from all the above.
// Array of tokens is listed chronologically so the last item of the array is
// the latest. To easily parse the data, I have flipped the array
async function getAllLatestEvents() {
  const endpoint = 'https://api.fxhash.xyz/graphql'

  const graphQLClient = new GraphQLClient(endpoint)

  const collectionQuery = gql`
    query GenerativeTokens {
      generativeTokens {
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
            displayUri
            activeListing {
              price
            }
            rarity
            owner {
              id
              name
            }
            features
          }
        }
      }
    }
  `
  const variables = {
  }

  const chronoData = await graphQLClient.request(collectionQuery, variables)
  const slugData = chronoData.generativeTokens.reverse();
  console.log(JSON.stringify(slugData, undefined, 2));
}

getAllLatestEvents().catch((error) => console.error(error));
//collectionActiveListings(collection).catch((error) => console.error(error));
//tokenListing(collection, tokenID).catch((error) => console.error(error));
//trackCollection(collection).catch((error) => console.error(error));
//trackToken(collection, tokenID).catch((error) => console.error(error));

