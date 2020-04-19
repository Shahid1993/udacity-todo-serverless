import * as AWS  from 'aws-sdk'
//const AWSXRay = require('aws-xray-sdk')
import * as AWSXRay from 'aws-xray-sdk'  // Gives Type definitions error (https://stackoverflow.com/questions/60207668)
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ){}

    async getAllTodos(
        userId: string
    ): Promise<TodoItem[]> {
        console.log('Getting all todos')

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId' : userId
            }
        }).promise()

        const todos = result.Items
        return todos as TodoItem[]
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE){
        console.log('Creating a local dynamodb instance')

        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}