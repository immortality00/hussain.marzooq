const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin with credentials
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  })
});

const db = admin.firestore();

const testItem = {
  title: 'Test Item',
  description: 'This is a test item added via script',
  imageUrl: 'https://example.com/test-image.jpg',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

const collections = ['photography', 'film', 'webdev', 'nfts', 'dance'];

async function addTestData() {
  try {
    for (const collectionName of collections) {
      console.log(`Adding test item to ${collectionName} collection...`);
      const docRef = await db.collection(collectionName).add(testItem);
      console.log(`Successfully added test item to ${collectionName} with ID: ${docRef.id}`);
    }
    console.log('Completed adding test data to all collections');
    process.exit(0);
  } catch (error) {
    console.error('Error adding test data:', error);
    process.exit(1);
  }
}

addTestData(); 