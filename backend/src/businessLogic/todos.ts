import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

export async function getAllTodos(
    jwtToken: string
): Promise<TodoItem[]> {

    const userId = parseUserId(jwtToken)

    return todoAccess.getAllTodos(userId)
}