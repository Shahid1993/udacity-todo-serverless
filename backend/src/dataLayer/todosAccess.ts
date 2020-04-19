import * as AWS  from 'aws-sdk'
//const AWSXRay = require('aws-xray-sdk')
import * as AWSXRay from 'aws-xray-sdk'  // Gives Type definitions error (https://stackoverflow.com/questions/60207668)
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

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

    async updateTodo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
        console.log(`Updating existing todo item with id ${todoId}`)

        const params = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
            ExpressionAttributeNames: {
                "#name": "name",
                "#dueDate": "dueDate",
                "#done": "done"
            },
            ExpressionAttributeValues: {
                ":name": todoUpdate['name'],
                ":dueDate": todoUpdate['dueDate'],
                ":done": todoUpdate['done']
            },
            ReturnValues: "ALL_NEW"
        }

        const result = await this.docClient.update(params).promise()

        const attributes = result.Attributes

        return attributes as TodoUpdate
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