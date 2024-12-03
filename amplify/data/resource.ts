import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  GenerationHistory: a
    .model({
      prompt: a.string().required(),
      result: a.string().required(),
      userId: a.string(), // オプショナル。将来的なユーザー認証のために
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

// Used for code completion / highlighting when making requests from frontend
export type Schema = ClientSchema<typeof schema>;

// defines the data resource to be deployed
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});
