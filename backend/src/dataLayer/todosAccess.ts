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

        const params = {
            TableName: this.todosTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }

        const result = await this.docClient.query(params).promise()

        const todos = result.Items
        return todos as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        console.log(`Creating new todo with id ${todo.todoId}`)

        const params = {
            TableName: this.todosTable,
            Item: todo
        }

        await this.docClient.put(params).promise()

        return todo as TodoItem
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