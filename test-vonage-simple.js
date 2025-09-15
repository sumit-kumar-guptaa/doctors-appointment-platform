require('dotenv').config();

async function testVonageSimple() {
  try {
    console.log('🔍 Testing basic Vonage Video API...');
    
    // Try using OpenTok (legacy) library which might be more stable
    const OpenTok = require('opentok');
    
    const apiKey = process.env.VONAGE_API_KEY;
    const apiSecret = process.env.VONAGE_API_SECRET;
    
    console.log('API Key:', apiKey);
    console.log('API Secret:', apiSecret ? '[SET]' : '[NOT SET]');
    
    if (!apiKey || !apiSecret) {
      console.log('❌ Missing API Key or Secret');
      return;
    }
    
    const opentok = new OpenTok(apiKey, apiSecret);
    
    console.log('🎥 Creating session with OpenTok...');
    
    opentok.createSession({ mediaMode: 'routed' }, (error, session) => {
      if (error) {
        console.error('❌ OpenTok session creation failed:', error);
      } else {
        console.log('✅ OpenTok session created successfully!');
        console.log('Session ID:', session.sessionId);
        
        // Test token generation
        const token = opentok.generateToken(session.sessionId, {
          role: 'publisher',
          expireTime: Math.round(new Date().getTime() / 1000) + (24 * 60 * 60) // 24 hours
        });
        
        console.log('✅ Token generated successfully!');
        console.log('Token length:', token.length);
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testVonageSimple();