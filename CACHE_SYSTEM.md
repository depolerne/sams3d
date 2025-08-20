# 3D Model Cache System

Эта система кеширования оптимизирует загрузку и отображение 3D моделей в приложении ресторана.

## Основные компоненты

### 1. ModelCache (`utils/ModelCache.ts`)
Основной менеджер кеша, который:
- Кеширует загруженные 3D модели и материалы
- Предотвращает дублирование запросов
- Автоматически очищает старые записи (30 минут)
- Ограничивает размер кеша (50 моделей)
- Правильно освобождает память Three.js объектов

### 2. useModelCache Hook (`hooks/useModelCache.ts`)
React хук для работы с кешем:
```typescript
const { cacheInfo, preloadModel, preloadModels, hasModel, clearCache, isLoading } = useModelCache();
```

### 3. CacheDebugInfo (`components/CacheDebugInfo.tsx`)
Компонент для отладки кеша (только в development режиме):
- Показывает статистику кеша
- Позволяет очистить кеш
- Отображает текущие загрузки

### 4. CacheLoadingIndicator (`components/CacheLoadingIndicator.tsx`)
Индикатор загрузки моделей:
- Показывается при активной загрузке
- Отображает количество загружающихся моделей
- Анимированный прогресс-бар

## Как работает кеширование

### Автоматическое кеширование
1. При загрузке модели через `Model3DPreview` или `Model3DViewer`
2. Модель автоматически сохраняется в кеш
3. Повторные запросы возвращают клонированную модель из кеша

### Предзагрузка
1. При загрузке страницы предзагружаются первые 6 моделей категории "salads"
2. При смене категории предзагружаются до 8 моделей новой категории
3. Предзагрузка происходит в фоне, не блокируя UI

### Управление памятью
- Автоматическая очистка моделей старше 30 минут
- Лимит в 50 моделей в кеше
- Правильное освобождение Three.js ресурсов
- Клонирование объектов для безопасного использования

## Использование

### Базовое использование
```typescript
// Загрузка модели с кешированием
const model = await modelCache.loadModel('/models/salad1.obj', '/models/salad1.mtl');

// Предзагрузка модели
await modelCache.preloadModels([
  { modelPath: '/models/salad1.obj', mtlPath: '/models/salad1.mtl' },
  { modelPath: '/models/salad2.obj', mtlPath: '/models/salad2.mtl' }
]);

// Проверка наличия в кеше
const isInCache = modelCache.hasModel('/models/salad1.obj', '/models/salad1.mtl');
```

### С React хуком
```typescript
function MyComponent() {
  const { preloadModels, hasModel, cacheInfo } = useModelCache();
  
  useEffect(() => {
    preloadModels(modelsToPreload);
  }, []);
  
  return (
    <div>
      <p>Cached models: {cacheInfo.modelCacheSize}</p>
      {hasModel(modelPath, mtlPath) && <p>Model is cached!</p>}
    </div>
  );
}
```

## Оптимизации

1. **Предотвращение дублирования**: Если модель уже загружается, новые запросы ждут завершения текущей загрузки
2. **Клонирование**: Каждый запрос получает клон модели, предотвращая конфликты
3. **Фоновая предзагрузка**: Модели загружаются заранее, улучшая UX
4. **Умная очистка**: Старые модели удаляются автоматически
5. **Освобождение памяти**: Three.js ресурсы правильно освобождаются

## Мониторинг

В development режиме доступен компонент `CacheDebugInfo`, который показывает:
- Количество кешированных моделей и материалов
- Количество активных загрузок
- Кнопку очистки кеша

Индикатор `CacheLoadingIndicator` показывает прогресс загрузки моделей в реальном времени.