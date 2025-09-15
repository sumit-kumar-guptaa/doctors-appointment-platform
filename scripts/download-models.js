/**
 * Download Face-API.js Models Script
 * Downloads required models for emotion analysis
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const models = [
  {
    name: 'tiny_face_detector_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json'
  },
  {
    name: 'tiny_face_detector_model-shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1'
  },
  {
    name: 'face_expression_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json'
  },
  {
    name: 'face_expression_model-shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1'
  },
  {
    name: 'face_landmark_68_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json'
  },
  {
    name: 'face_landmark_68_model-shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1'
  },
  {
    name: 'face_recognition_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json'
  },
  {
    name: 'face_recognition_model-shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1'
  },
  {
    name: 'face_recognition_model-shard2',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2'
  }
];

async function downloadModel(model) {
  const modelPath = path.join(__dirname, '../public/models', model.name);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(modelPath);
    
    https.get(model.url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${model.name}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(modelPath, () => {}); // Delete the file on error
        console.error(`✗ Failed to download ${model.name}:`, err);
        reject(err);
      });
    }).on('error', (err) => {
      console.error(`✗ Request failed for ${model.name}:`, err);
      reject(err);
    });
  });
}

async function downloadAllModels() {
  console.log('📦 Downloading Face-API.js models for emotion analysis...');
  
  for (const model of models) {
    try {
      await downloadModel(model);
    } catch (error) {
      console.error(`Failed to download ${model.name}:`, error);
    }
  }
  
  console.log('🎯 All Face-API.js models downloaded successfully!');
}

// Run if called directly
if (require.main === module) {
  downloadAllModels().catch(console.error);
}

module.exports = { downloadAllModels };