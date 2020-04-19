import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodo } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const todoId = event.pathParameters.todoId

  // TODO: Remove a TODO item by id
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  await deleteTodo(todoId, jwtToken)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin' : '*'
    },
    body: null
  }
}
