import { Handler } from '@netlify/functions';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { ContactFormData, ContactFormResponse } from '../../src/types/contact';

// Initialize Firebase Admin
if (getApps().length === 0) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const db = getFirestore();

const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' }),
    };
  }

  try {
    // Parse the request body
    const data: ContactFormData = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Name, email, and message are required',
        }),
      };
    }

    // Add timestamp
    const formData: ContactFormData = {
      ...data,
      createdAt: Date.now(),
    };

    // Save to Firestore
    const docRef = await db.collection('inquiries').add(formData);

    const response: ContactFormResponse = {
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      inquiryId: docRef.id,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error processing contact form:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'An error occurred while processing your request.',
      }),
    };
  }
};

export { handler }; 