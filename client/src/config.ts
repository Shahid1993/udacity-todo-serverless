// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'shfuo8nq9c'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-25c8tyzh.auth0.com',            // Auth0 domain
  clientId: 'U7tQCqBtdqkDgv1t9oRqUxeiMqIn6sy4',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
