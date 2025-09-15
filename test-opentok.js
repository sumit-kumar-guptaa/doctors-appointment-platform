require('dotenv').config();

async function testVonageWithOpenTok() {
  try {
    console.log('🔍 Testing Vonage Video API with OpenTok library...');
    
    const OpenTok = require('opentok');
    
    const apiKey = process.env.VONAGE_API_KEY;
    const apiSecret = process.env.VONAGE_API_SECRET;
    
    console.log('API Key:', apiKey);
    console.log('API Secret:', apiSecret ? '[SET - ' + apiSecret.length + ' chars]' : '[NOT SET]');
    
    if (!apiKey || !apiSecret) {
      console.log('❌ Missing API Key or Secret');
      return { success: false, error: 'Missing credentials' };
    }
    
    const opentok = new OpenTok(apiKey, apiSecret);
    
    console.log('🎥 Creating session with OpenTok...');
    
    // Use Promise wrapper for the callback-based API
    const session = await new Promise((resolve, reject) => {
      opentok.createSession({ 
        mediaMode: 'routed',
        archiveMode: 'manual' 
      }, (error, session) => {
        if (error) {
          reject(error);
        } else {
          resolve(session);
        }
      });
    });
    
    console.log('✅ OpenTok session created successfully!');
    console.log('Session ID:', session.sessionId);
    
    // Test token generation
    console.log('🎫 Generating token...');
    const token = opentok.generateToken(session.sessionId, {
      role: 'publisher',
      expireTime: Math.round(new Date().getTime() / 1000) + (24 * 60 * 60), // 24 hours
      data: JSON.stringify({ name: 'Test User' })
    });
    
    console.log('✅ Token generated successfully!');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    return {
      success: true,
      sessionId: session.sessionId,
      token: token,
      apiKey: apiKey
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testVonageWithOpenTok()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Vonage Video API is working correctly!');
      console.log('📊 Summary:');
      console.log('- Session ID:', result.sessionId);
      console.log('- API Key:', result.apiKey);
      console.log('- Token generated:', result.token ? 'YES' : 'NO');
    } else {
      console.log('\n💥 Vonage API test failed:', result.error);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Test crashed:', error);
    process.exit(1);
  });