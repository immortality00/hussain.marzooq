import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioItems, getCategoryMetadata, addPortfolioItem } from '@/lib/firebase/portfolio';
import { PortfolioCategory } from '@/types/portfolio';

// Helper function to validate category
const validateCategory = (category: string): category is PortfolioCategory => {
  return ['photography', 'film', 'webdev', 'nfts', 'dance'].includes(category);
};

// GET handler for retrieving portfolio items and metadata
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

    // Get both items and metadata
    const [itemsResult, metadataResult] = await Promise.all([
      getPortfolioItems(category),
      getCategoryMetadata(category)
    ]);

    // Return combined results
    return NextResponse.json({
      category,
      items: itemsResult.items,
      metadata: metadataResult.metadata,
      error: itemsResult.error || metadataResult.error
    });
  } catch (error) {
    console.error('Error retrieving portfolio data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve portfolio data' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new portfolio item
export async function POST(
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
    
    const result = await addPortfolioItem(category, body);
    
    return NextResponse.json({
      category,
      id: result.id,
      error: result.error
    });
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio item' },
      { status: 500 }
    );
  }
} 