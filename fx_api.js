const { GraphQLClient, gql } = require('graphql-request');

const formattedOutput = {
  id: 0,
  collectionName: null,
  collectionSlug: null,
  price: null,
  symbol: "XTZ",
  imageUrl: null,
  permalink: null,
  tokenId: null,
  rarity: null,
  traits: [],
  contractAddress: null,
  site: "fx(hash)",
  fromName: null,
  fromAddress: null,
  toName: null,
  toAddress: null,
  txHash: null,
  type: null,
  isPrivate: false,
  amount: 1,
};

var TRACKED_TEZOS_ADDRESSES = {}; // (address -> bool)
var TRACKED_TEZOS_SLUGS = {};     // (slugName -> bool)
var RECENTLY_SEEN = {};           // (slugName -> action id)
var eventsToEvaluate = [];

async function getAllLatestEvents() {
  const endpoint = 'https://api.fxhash.xyz/graphql';
  const gateway = "https://gateway.fxhash.xyz/ipfs/";
  const collectionPermalink = "https://www.fxhash.xyz/generative/slug/";
  const tokenPermalink = "https://www.fxhash.xyz/gentk/slug/";

  const graphQLClient = new GraphQLClient(endpoint);

  const collectionQuery = gql`
    query GenerativeTokens($take: Int, $filters: ActionFilter) {
      generativeTokens {
        name
        slug
        id
        displayUri
        supply
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
          opHash
          objkt {
            id
            slug
            name
            displayUri
            activeListing {
              price
            }
            rarity
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

  for (let i = 0; i < slugData.generativeTokens.length; i++) {
    // Check if event action id has already been seen
    if (RECENTLY_SEEN[slugData.generativeTokens[i].slug] == slugData.generativeTokens[i].actions[0].id) {
      continue;
    } else {
      //console.log(JSON.stringify(slugData.generativeTokens[i], undefined, 2));
      RECENTLY_SEEN[slugData.generativeTokens[i].slug] = slugData.generativeTokens[i].actions[0].id;
      let event = formattedOutput;
      // Fill generic data
      event.id = slugData.generativeTokens[i].id;
      event.collectionSlug = slugData.generativeTokens[i].slug;
      event.collectionName = slugData.generativeTokens[i].name;
      event.txHash = slugData.generativeTokens[i].actions[0].opHash;
      event.type = slugData.generativeTokens[i].actions[0].type;
      event.fromName = slugData.generativeTokens[i].actions[0].issuer.name;
      event.fromAddress = slugData.generativeTokens[i].actions[0].issuer.id;
      event.price = Number.parseFloat(slugData.generativeTokens[i].actions[0].numericValue / (10 ** 6)).toFixed(3);
      if (slugData.generativeTokens[i].actions[0].target != null) {
        event.toName = slugData.generativeTokens[i].actions[0].target.name;
        event.toAddress = slugData.generativeTokens[i].actions[0].target.id;
      }

      const token = slugData.generativeTokens[i].actions[0].objkt;
      if (token == null) {
        // If collection mint
        event.imageUrl = `${gateway}${slugData.generativeTokens[i].displayUri.replace("ipfs://", "")}`;
        event.permalink = `${collectionPermalink}${event.collectionSlug}`;
        event.amount = slugData.generativeTokens[i].supply;
      } else {
        // If Object exists
        event.tokenId = token.id;
        event.imageUrl = `${gateway}${token.displayUri.replace("ipfs://", "")}`;
        event.permalink = `${tokenPermalink}${token.slug}`;
        event.rarity = token.rarity;
        event.traits = token.features;
        // If there is an active listing, update price math
        if (token.activeListing != null) {
          event.price = Number.parseFloat(token.activeListing.price / (10 ** 6)).toFixed(3);
        }
      }

      //console.log(event);
      eventsToEvaluate.push(event);
    }
  }

  console.log(eventsToEvaluate);
}

getAllLatestEvents().catch((error) => console.error(error));
