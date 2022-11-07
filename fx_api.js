const { GraphQLClient, gql } = require('graphql-request');

let formattedOutput = {
  id: 0,
  price: 0.0,
  symbol: "XTZ",
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
};

var TRACKED_TEZOS_ADDRESSES = {}; // (address -> bool)
var TRACKED_TEZOS_SLUGS = {};     // (slugName -> bool)
var RECENTLY_SEEN = {};           // (slugName -> action id)
var eventsToEvaluate = [];

async function getAllLatestEvents() {
  const endpoint = 'https://api.fxhash.xyz/graphql';

  const graphQLClient = new GraphQLClient(endpoint);

  const collectionQuery = gql`
    query GenerativeTokens($take: Int, $filters: ActionFilter) {
      generativeTokens {
        name
        slug
        id
        actions(take: $take, filters: $filters) {
          id
          issuer {
            id
            name
          }
          target {
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
  `;

  const variables = {
    "take": 1, // Only takes the latest event as they are chonological pushed
    "filters": {
      "type_in": [
        "MINTED", // Sole minted NFTs
        "MINTED_FROM", // Minted NFTs in collections
        "LISTING_V2", "LISTING_V3", // Active listings
        "OFFER_ACCEPTED", "LISTING_V2_ACCEPTED", "LISTING_V3_ACCEPTED" // Sales
        ]
    },
  };

  const slugData = await graphQLClient.request(collectionQuery, variables);
  //console.log(JSON.stringify(slugData, undefined, 2));



  const chronoData = await graphQLClient.request(collectionQuery, variables)
  const slugData = chronoData.generativeTokens.reverse();
  console.log(JSON.stringify(slugData, undefined, 2));
}

getAllLatestEvents().catch((error) => console.error(error));
