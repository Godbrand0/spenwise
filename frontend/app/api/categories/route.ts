import { NextRequest, NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/database/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const { data: categories, error } = await getCategories(
      userId || undefined,
    );

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 },
      );
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error in categories API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, name, keywords, isIncome, parentCategory } =
      await req.json();

    if (!userId || !name) {
      return NextResponse.json(
        { error: "User ID and name are required" },
        { status: 400 },
      );
    }

    const categoryData = {
      user_id: userId,
      name,
      keywords: keywords || [],
      parent_category: parentCategory || null,
      is_income: isIncome || false,
      is_default: false,
    };

    const { data: category, error } = await createCategory(categoryData);

    if (error) {
      console.error("Error creating category:", error);
      return NextResponse.json(
        { error: "Failed to create category" },
        { status: 500 },
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error in categories API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
