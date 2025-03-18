import { NextRequest, NextResponse } from 'next/server';
import { updatePortfolioItem, deletePortfolioItem } from '@/lib/firebase/portfolio';
import { PortfolioCategory } from '@/types/portfolio';

// Helper function to validate category
const validateCategory = (category: string): category is PortfolioCategory => {
  return ['photography', 'film', 'webdev', 'nfts', 'dance'].includes(category);
};

// PUT handler for updating a portfolio item
export async function PUT(
  request: NextRequest,
  { params }: { params: { category: string; itemId: string } }
) {
  try {
    const { category, itemId } = await params;
    
    // Validate parameters
    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!validateCategory(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    const result = await updatePortfolioItem(category, itemId, body);
    
    return NextResponse.json({
      category,
      itemId,
      success: result.success,
      error: result.error
    });
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio item' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a portfolio item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { category: string; itemId: string } }
) {
  try {
    const { category, itemId } = await params;
    
    // Validate parameters
    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!validateCategory(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }
    
    const result = await deletePortfolioItem(category, itemId);
    
    return NextResponse.json({
      category,
      itemId,
      success: result.success,
      error: result.error
    });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio item' },
      { status: 500 }
    );
  }
} 