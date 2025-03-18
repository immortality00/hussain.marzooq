import { NextRequest, NextResponse } from 'next/server';
import { getCategoryMetadata, updateCategoryMetadata } from '@/lib/firebase/portfolio';
import { PortfolioCategory } from '@/types/portfolio';

// Helper function to validate category
const validateCategory = (category: string): category is PortfolioCategory => {
  return ['photography', 'film', 'webdev', 'nfts', 'dance'].includes(category);
};

// GET handler for retrieving portfolio metadata
export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { category } = await params;
    
    // Validate category
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

    const result = await getCategoryMetadata(category);
    
    return NextResponse.json({
      category,
      metadata: result.metadata,
      error: result.error
    });
  } catch (error) {
    console.error('Error retrieving category metadata:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve category metadata' },
      { status: 500 }
    );
  }
}

// PUT handler for updating portfolio metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { category } = await params;
    
    // Validate category
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
    
    // Parse the request body
    const body = await request.json();
    
    const result = await updateCategoryMetadata(category, body);
    
    return NextResponse.json({
      category,
      success: result.success,
      error: result.error
    });
  } catch (error) {
    console.error('Error updating category metadata:', error);
    return NextResponse.json(
      { error: 'Failed to update category metadata' },
      { status: 500 }
    );
  }
} 