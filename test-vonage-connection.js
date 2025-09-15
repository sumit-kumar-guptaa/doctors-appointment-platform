require('dotenv').config();
const { Vonage } = require('@vonage/server-sdk');
const { Auth } = require('@vonage/auth');

async function testVonageConnection() {
  try {
    console.log('🔍 Testing Vonage API connection...');
    
    // Check environment variables
    console.log('Environment variables:');
    console.log('- VONAGE_APPLICATION_ID:', process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID);
    console.log('- VONAGE_API_KEY:', process.env.VONAGE_API_KEY);
    console.log('- VONAGE_API_SECRET:', process.env.VONAGE_API_SECRET ? '[SET]' : '[NOT SET]');
    console.log('- VONAGE_PRIVATE_KEY:', process.env.VONAGE_PRIVATE_KEY ? '[SET]' : '[NOT SET]');
    
    // Method 1: Using Application ID and Private Key (Recommended for Video API)
    console.log('\n🔑 Testing with Application ID and Private Key...');
    try {
      const credentials = new Auth({
        applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID,
        privateKey: process.env.VONAGE_PRIVATE_KEY,
      });
      
      const vonage = new Vonage(credentials);
      
      // Test creating a video session
      const sessionOptions = {
        mediaMode: "routed",
        archiveMode: "manual",
      };
      
      const session = await vonage.video.createSession(sessionOptions);
      console.log('✅ Video session created successfully!');
      console.log('Session ID:', session.sessionId);
      
      return { success: true, sessionId: session.sessionId };
      
    } catch (error) {
      console.error('❌ Application ID method failed:', error.message);
    }
    
    // Method 2: Using API Key and Secret (Alternative)
    console.log('\n🔑 Testing with API Key and Secret...');
    try {
      const credentials = new Auth({
        apiKey: process.env.VONAGE_API_KEY,
        apiSecret: process.env.VONAGE_API_SECRET,
      });
      
      const vonage = new Vonage(credentials);
      
      // Test creating a video session
      const sessionOptions = {
        mediaMode: "routed",
        archiveMode: "manual",
      };
      
      const session = await vonage.video.createSession(sessionOptions);
      console.log('✅ Video session created successfully with API Key!');
      console.log('Session ID:', session.sessionId);
      
      return { success: true, sessionId: session.sessionId };
      
    } catch (error) {
      console.error('❌ API Key method failed:', error.message);
    }
    
    // Method 3: Direct Video API approach
    console.log('\n🔑 Testing direct Video API...');
    try {
      const { Video } = require('@vonage/video');
      
      const videoApi = new Video({
        apiKey: process.env.VONAGE_API_KEY,
        apiSecret: process.env.VONAGE_API_SECRET,
      });
      
      const session = await videoApi.createSession({
        mediaMode: "routed",
        archiveMode: "manual",
      });
      
      console.log('✅ Direct Video API worked!');
      console.log('Session ID:', session.sessionId);
      
      return { success: true, sessionId: session.sessionId };
      
    } catch (error) {
      console.error('❌ Direct Video API failed:', error.message);
    }
    
    throw new Error('All connection methods failed');
    
  } catch (error) {
    console.error('❌ Vonage connection test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testVonageConnection()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Vonage API is working correctly!');
    } else {
      console.log('\n💥 Vonage API test failed:', result.error);
    }
  })
  .catch(error => {
    console.error('\n💥 Test crashed:', error);
  });