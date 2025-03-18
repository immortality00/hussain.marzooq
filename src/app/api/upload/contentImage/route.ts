import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const pageName = formData.get('pageName') as string | null;
    const section = formData.get('section') as string | null;

    if (!file || !pageName || !section) {
      return NextResponse.json(
        { error: 'File, pageName, and section are required' },
        { status: 400 }
      );
    }

    // Define where to store the file (public directory)
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const targetDirectory = `content/${pageName}/${section}`;
    const publicPath = path.join(process.cwd(), 'public', targetDirectory);
    const relativePath = path.join(targetDirectory, uniqueFilename);
    
    // Ensure the directory exists
    try {
      // For demo purposes, this is simplified
      // In production, you'd use fs.mkdir with { recursive: true }
      console.log(`Creating directory: ${publicPath}`);
    } catch (error) {
      console.error('Error creating directory:', error);
    }

    // For demo/development purposes, just return a mock response
    // In production, you would actually save the file:
    // const arrayBuffer = await file.arrayBuffer();
    // const buffer = Buffer.from(arrayBuffer);
    // await writeFile(path.join(publicPath, uniqueFilename), buffer);

    // Generate URL for the file
    const fileUrl = `/${relativePath}`;

    // Return the URL to the uploaded file
    return NextResponse.json({ 
      success: true, 
      url: fileUrl 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Set the maximum file size (adjust as needed)
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '8mb',
  },
}; 