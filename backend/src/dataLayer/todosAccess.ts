import * as AWS  from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {Types} from 'aws-sdk/clients/s3'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'


export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly s3: Types = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = process.env.TODO_S3_BUCKET,
        private readonly urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)
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

    async deleteTodo(todoId: string, userId: string) {
        console.log(`Deleting existing todo item with id ${todoId}`)

        const params = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        await this.docClient.delete(params).promise();

        return
    }

    async generateUploadUrl(todoId: string, userId: string): Promise<string> {
        console.log(`Generating upload url of attachment for todo item with id ${todoId}`)

        // update attachment url in todo table
        await this.addAttachmentToTodoItem(todoId, userId)  

        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: this.urlExpiration
        })
    }

    async addAttachmentToTodoItem(todoId: string, userId: string){

        console.log('Updating attachment url')
    
        const attachmentUrl: string = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
    
        const params = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #attachmentUrl = :attachmentUrl",
            ExpressionAttributeNames: {
                "#attachmentUrl": "attachmentUrl"
            },
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl
            },
            ReturnValues: "ALL_NEW"
        }
    
        const result = await this.docClient.update(params).promise()
    
        return result.Attributes
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