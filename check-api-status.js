require('dotenv').config();
const { Translate } = require('@google-cloud/translate').v2;

async function checkAPIStatus() {
    console.log('🔍 CHECKING GOOGLE TRANSLATE API STATUS');
    console.log('=====================================');
    
    try {
        const translate = new Translate({
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            key: process.env.GOOGLE_TRANSLATE_API_KEY,
        });

        console.log('📋 Project Details:');
        console.log(`   Project ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`);
        console.log(`   API Key: ${process.env.GOOGLE_TRANSLATE_API_KEY ? '✅ Found' : '❌ Missing'}`);
        console.log('');

        console.log('🧪 Testing simple translation...');
        
        const [translation] = await translate.translate('Hello', 'es');
        console.log('✅ SUCCESS! Translation API is working');
        console.log(`   Input: "Hello"`);
        console.log(`   Output: "${translation}"`);
        
        console.log('');
        console.log('🎯 API STATUS: ENABLED AND WORKING');
        
    } catch (error) {
        console.log('❌ API ERROR:', error.message);
        
        if (error.message.includes('API has not been used')) {
            console.log('');
            console.log('🔧 SOLUTION:');
            console.log('1. Go to: https://console.cloud.google.com/apis/library/translate.googleapis.com');
            console.log(`2. Select project: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`);
            console.log('3. Click "ENABLE"');
            console.log('4. Wait 2-5 minutes for propagation');
        }
        
        if (error.message.includes('billing')) {
            console.log('');
            console.log('💳 BILLING REQUIRED:');
            console.log('1. Go to: https://console.cloud.google.com/billing');
            console.log('2. Link a billing account to your project');
            console.log('3. Google Translate API requires billing for usage');
        }
        
        if (error.message.includes('permission') || error.message.includes('unauthorized')) {
            console.log('');
            console.log('🔑 API KEY ISSUE:');
            console.log('1. Check if your API key has Translate API permissions');
            console.log('2. Regenerate API key if needed');
        }
    }
}

// Run the check
checkAPIStatus();