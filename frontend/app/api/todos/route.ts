import { NextRequest, NextResponse } from "next/server";
import {
  getFinancialTodosByUserId,
  createFinancialTodo,
  updateFinancialTodo,
  deleteFinancialTodo,
} from "../../../../lib/database/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const { data: todos, error } = await getFinancialTodosByUserId(userId);

    if (error) {
      console.error("Error fetching todos:", error);
      return NextResponse.json(
        { error: "Failed to fetch todos" },
        { status: 500 },
      );
    }

    return NextResponse.json(todos);
  } catch (error) {
    console.error("Error in todos API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      title,
      description,
      category,
      priority,
      targetAmount,
      targetDate,
      isRecurring,
      recurringFrequency,
      tags,
    } = await req.json();

    if (!userId || !title || !category) {
      return NextResponse.json(
        { error: "User ID, title, and category are required" },
        { status: 400 },
      );
    }

    const todoData = {
      user_id: userId,
      title,
      description: description || null,
      category,
      priority: priority || "medium",
      target_amount: targetAmount || null,
      current_amount: 0,
      target_date: targetDate || null,
      is_recurring: isRecurring || false,
      recurring_frequency: recurringFrequency || null,
      tags: tags || [],
    };

    const { data: todo, error } = await createFinancialTodo(todoData);

    if (error) {
      console.error("Error creating todo:", error);
      return NextResponse.json(
        { error: "Failed to create todo" },
        { status: 500 },
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Error in todos API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { todoId, updates } = await req.json();

    if (!todoId) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 },
      );
    }

    const { data: todo, error } = await updateFinancialTodo(todoId, updates);

    if (error) {
      console.error("Error updating todo:", error);
      return NextResponse.json(
        { error: "Failed to update todo" },
        { status: 500 },
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Error in todos API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const todoId = searchParams.get("todoId");

    if (!todoId) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 },
      );
    }

    const { error } = await deleteFinancialTodo(todoId);

    if (error) {
      console.error("Error deleting todo:", error);
      return NextResponse.json(
        { error: "Failed to delete todo" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in todos API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
