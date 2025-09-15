/**
 * Direct Google Translate API Test
 * Tests the real Google Translate API with official responses
 * NO HARDCODED DATA - Only real API responses
 */

const { Translate } = require('@google-cloud/translate').v2;
require('dotenv').config();

async function testRealGoogleTranslateAPI() {
  console.log('🌍 TESTING REAL GOOGLE TRANSLATE API');
  console.log('=====================================');
  
  // Check if API key exists
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GEMINI_API_KEY;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  
  console.log('📋 Configuration:');
  console.log(`   - API Key: ${apiKey ? '✅ Found' : '❌ Missing'}`);
  console.log(`   - Project ID: ${projectId || 'Not set'}`);
  
  if (!apiKey) {
    console.log('❌ Cannot test - No API key found');
    return;
  }
  
  // Initialize Google Translate with your API key
  const translate = new Translate({
    key: apiKey,
    projectId: projectId
  });
  
  console.log('\n🔧 Testing Google Translate API...');
  
  // Test 1: Medical English to Spanish
  try {
    console.log('\n📝 TEST 1: Medical Translation (EN → ES)');
    console.log('   Input: "The patient has a severe headache and elevated blood pressure"');
    
    const [translation] = await translate.translate(
      'The patient has a severe headache and elevated blood pressure',
      'es'
    );
    
    console.log('   ✅ OFFICIAL TRANSLATION:', translation);
    
  } catch (error) {
    console.log('   ❌ Translation failed:', error.message);
    if (error.message.includes('API key')) {
      console.log('   💡 The API key might need Google Translate API enabled');
    }
  }
  
  // Test 2: Medical Spanish to English
  try {
    console.log('\n📝 TEST 2: Medical Translation (ES → EN)');
    console.log('   Input: "El paciente tiene dolor de pecho y dificultad para respirar"');
    
    const [translation] = await translate.translate(
      'El paciente tiene dolor de pecho y dificultad para respirar',
      'en'
    );
    
    console.log('   ✅ OFFICIAL TRANSLATION:', translation);
    
  } catch (error) {
    console.log('   ❌ Translation failed:', error.message);
  }
  
  // Test 3: Medical Arabic to English
  try {
    console.log('\n📝 TEST 3: Medical Translation (AR → EN)');
    console.log('   Input: "المريض يعاني من حمى شديدة وصداع"');
    
    const [translation] = await translate.translate(
      'المريض يعاني من حمى شديدة وصداع',
      'en'
    );
    
    console.log('   ✅ OFFICIAL TRANSLATION:', translation);
    
  } catch (error) {
    console.log('   ❌ Translation failed:', error.message);
  }
  
  // Test 4: Complex Medical Terms
  try {
    console.log('\n📝 TEST 4: Complex Medical Terms (EN → ES)');
    console.log('   Input: "Administer 20mg of furosemide intravenously for acute pulmonary edema"');
    
    const [translation] = await translate.translate(
      'Administer 20mg of furosemide intravenously for acute pulmonary edema',
      'es'
    );
    
    console.log('   ✅ OFFICIAL TRANSLATION:', translation);
    
  } catch (error) {
    console.log('   ❌ Translation failed:', error.message);
  }
  
  // Test 5: Get Supported Languages
  try {
    console.log('\n📝 TEST 5: Get Supported Languages');
    
    const [languages] = await translate.getLanguages();
    
    console.log('   ✅ TOTAL SUPPORTED LANGUAGES:', languages.length);
    console.log('   🌍 Sample Languages:');
    
    // Show first 20 languages
    languages.slice(0, 20).forEach(lang => {
      console.log(`      - ${lang.code}: ${lang.name}`);
    });
    
    if (languages.length > 20) {
      console.log(`      ... and ${languages.length - 20} more languages`);
    }
    
  } catch (error) {
    console.log('   ❌ Languages fetch failed:', error.message);
  }
  
  // Test 6: Language Detection
  try {
    console.log('\n📝 TEST 6: Language Detection');
    const testText = 'Le patient a de la fièvre et des maux de tête';
    console.log(`   Input: "${testText}"`);
    
    const [detections] = await translate.detect(testText);
    const detection = Array.isArray(detections) ? detections[0] : detections;
    
    console.log('   ✅ DETECTED LANGUAGE:', detection.language);
    console.log('   📊 CONFIDENCE:', (detection.confidence * 100).toFixed(1) + '%');
    
  } catch (error) {
    console.log('   ❌ Language detection failed:', error.message);
  }
  
  // Test 7: Batch Translation
  try {
    console.log('\n📝 TEST 7: Batch Medical Translation');
    
    const medicalTexts = [
      'Take two tablets daily with food',
      'Patient shows signs of infection',
      'Schedule follow-up appointment in one week'
    ];
    
    console.log('   Input texts:');
    medicalTexts.forEach((text, i) => {
      console.log(`      ${i + 1}. "${text}"`);
    });
    
    const [translations] = await translate.translate(medicalTexts, 'fr');
    
    console.log('   ✅ OFFICIAL BATCH TRANSLATIONS (to French):');
    translations.forEach((translation, i) => {
      console.log(`      ${i + 1}. "${translation}"`);
    });
    
  } catch (error) {
    console.log('   ❌ Batch translation failed:', error.message);
  }
  
  console.log('\n🎯 TRANSLATION API TEST COMPLETE');
  console.log('=====================================');
}

// Run the test
if (require.main === module) {
  testRealGoogleTranslateAPI()
    .then(() => {
      console.log('\n✅ All tests completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testRealGoogleTranslateAPI };