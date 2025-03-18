import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/lib/database/strategy';

// Type definition for page content
interface PageContent {
  id: string;
  pageName: string;
  content: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// GET handler for retrieving page content
export async function GET(
  request: NextRequest,
  { params }: { params: { pageName: string } }
) {
  try {
    const { pageName } = await params;
    
    // Validate pageName
    if (!pageName) {
      return NextResponse.json(
        { error: 'Page name is required' },
        { status: 400 }
      );
    }

    // Use our repository pattern to get the page content
    const pageContentRepository = getRepository<PageContent>('pageContent');
    const content = await pageContentRepository.getAll({
      where: { pageName }
    });

    // If no content found, return a default template
    if (!content || content.length === 0) {
      const defaultContent = {
        pageName,
        content: {
          hero: {
            title: 'Welcome to My Portfolio',
            subtitle: 'Discover my creative work across various mediums'
          }
        }
      };
      
      return NextResponse.json(defaultContent);
    }

    return NextResponse.json(content[0]);
  } catch (error) {
    console.error('Error retrieving page content:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve page content' },
      { status: 500 }
    );
  }
}

// PUT handler for updating page content
export async function PUT(
  request: NextRequest,
  { params }: { params: { pageName: string } }
) {
  try {
    const { pageName } = await params;
    
    // Validate pageName
    if (!pageName) {
      return NextResponse.json(
        { error: 'Page name is required' },
        { status: 400 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Get the repository
    const pageContentRepository = getRepository<PageContent>('pageContent');
    
    // Check if the page content already exists
    const existingContents = await pageContentRepository.getAll({
      where: { pageName }
    });
    
    let result;
    
    if (existingContents && existingContents.length > 0) {
      // Update existing content
      result = await pageContentRepository.update(existingContents[0].id, {
        content: body.content
      });
    } else {
      // Create new content
      result = await pageContentRepository.create({
        pageName,
        content: body.content
      });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating page content:', error);
    return NextResponse.json(
      { error: 'Failed to update page content' },
      { status: 500 }
    );
  }
} 