const fs = require('fs');
const path = require('path');

// Читаем menu-data.json
const menuDataPath = path.join(__dirname, '../public/menu-data.json');
const menuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));

// Проверяем существование файлов моделей
function checkModelFiles() {
  console.log('🔍 Checking model files...');
  
  let totalModels = 0;
  let missingModels = [];
  let missingMaterials = [];
  
  menuData.categories.forEach(category => {
    console.log(`\n📂 Category: ${category.id}`);
    
    category.items.forEach(item => {
      totalModels++;
      
      // Проверяем OBJ файл
      const objPath = path.join(__dirname, '../public', item.modelPath);
      if (!fs.existsSync(objPath)) {
        missingModels.push({
          category: category.id,
          item: item.id,
          path: item.modelPath
        });
        console.log(`❌ Missing OBJ: ${item.modelPath}`);
      } else {
        console.log(`✅ Found OBJ: ${item.modelPath}`);
      }
      
      // Проверяем MTL файл
      if (item.mtlPath) {
        const mtlPath = path.join(__dirname, '../public', item.mtlPath);
        if (!fs.existsSync(mtlPath)) {
          missingMaterials.push({
            category: category.id,
            item: item.id,
            path: item.mtlPath
          });
          console.log(`⚠️ Missing MTL: ${item.mtlPath}`);
        } else {
          console.log(`✅ Found MTL: ${item.mtlPath}`);
        }
      }
    });
  });
  
  // Итоговый отчет
  console.log('\n📊 Summary:');
  console.log(`Total models checked: ${totalModels}`);
  console.log(`Missing OBJ files: ${missingModels.length}`);
  console.log(`Missing MTL files: ${missingMaterials.length}`);
  
  if (missingModels.length > 0) {
    console.log('\n❌ Missing OBJ files:');
    missingModels.forEach(model => {
      console.log(`  ${model.category}/${model.item}: ${model.path}`);
    });
  }
  
  if (missingMaterials.length > 0) {
    console.log('\n⚠️ Missing MTL files:');
    missingMaterials.forEach(material => {
      console.log(`  ${material.category}/${material.item}: ${material.path}`);
    });
  }
  
  if (missingModels.length === 0 && missingMaterials.length === 0) {
    console.log('\n🎉 All model files found!');
  }
}

checkModelFiles();