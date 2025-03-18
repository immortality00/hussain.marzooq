/**
 * This script creates a test user in Firebase for demonstration purposes
 * Run with: node scripts/createTestUser.js
 */

require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcryptjs');

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

// Get Firestore instance
const db = getFirestore(app);

// Create a test user
async function createTestUser() {
  try {
    // Generate a hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('test123', salt);
    
    // Define test user data
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Check if user already exists
    const userSnapshot = await db.collection('users')
      .where('email', '==', userData.email)
      .get();
    
    if (!userSnapshot.empty) {
      console.log('User already exists. Skipping creation.');
      return;
    }
    
    // Add user to Firebase
    const docRef = await db.collection('users').add(userData);
    
    console.log(`Test user created with ID: ${docRef.id}`);
    console.log('Email: test@example.com');
    console.log('Password: test123');
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

// Execute the function
createTestUser()
  .then(() => console.log('Script execution complete'))
  .catch(console.error); 