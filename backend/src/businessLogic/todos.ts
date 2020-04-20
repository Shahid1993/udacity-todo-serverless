import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoAccess } from '../dataLayer/todosAccess'
import { parseUserId } from '../auth/utils'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

export async function getAllTodos(
    jwtToken: string
): Promise<TodoItem[]> {

    const userId = parseUserId(jwtToken)

    return todoAccess.getAllTodos(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {

    const todoId = uuid.v4()
    const userId = parseUserId(jwtToken)

    return await todoAccess.createTodo({
        userId,
        todoId,
        done: false,
        ...createTodoRequest,
        createdAt: new Date().toISOString()
    })
}

export async function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    todoId: string,
    jwtToken: string
): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken)
    
    return await todoAccess.updateTodo(updateTodoRequest, todoId, userId)
}

export async function deleteTodo(
    todoId: string,
    jwtToken: string
){
    const userId = parseUserId(jwtToken)
    
    await todoAccess.deleteTodo(todoId, userId)
}

export async function generateUploadUrl(
    todoId: string,
    jwtToken: string
): Promise<string> {
    const userId = parseUserId(jwtToken)

    return todoAccess.generateUploadUrl(todoId, userId);
}