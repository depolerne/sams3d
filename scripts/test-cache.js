const fs = require('fs');
const path = require('path');

// Читаем menu-data.json
const menuDataPath = path.join(__dirname, '..', 'data', 'menu-data.json');
const menuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));

console.log('🧪 Testing cache key generation logic...');

// Функция для создания ключа кеша (копия из ModelCache)
function getModelKey(modelPath, mtlPath) {
  return `${modelPath}${mtlPath ? `|${mtlPath}` : ''}`;
}

// Тестируем создание ключей для первых нескольких моделей
let testCount = 0;
for (const category of menuData.categories) {
  if (testCount >= 5) break;
  
  for (const item of category.items) {
    if (testCount >= 5) break;
    
    const modelPath = item.modelPath;
    const mtlPath = item.mtlPath;
    const cacheKey = getModelKey(modelPath, mtlPath);
    
    console.log(`\n📝 Item: ${item.name}`);
    console.log(`   Model: ${modelPath}`);
    console.log(`   MTL: ${mtlPath || 'none'}`);
    console.log(`   Cache Key: ${cacheKey}`);
    
    testCount++;
  }
}

console.log('\n✅ Cache key test completed');