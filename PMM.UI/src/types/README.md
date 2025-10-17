# TypeScript Types Architecture

Bu proje için TypeScript türlerinin düzenli bir şekilde organize edilmesi amacıyla aşağıdaki mimari kullanılmaktadır.

## 📁 Klasör Yapısı

```
src/types/
├── index.ts              # Ana export dosyası
├── common/               # Ortak kullanılan türler
│   └── index.ts
├── projects/             # Proje domain'i
│   ├── index.ts
│   ├── api.ts           # API request/response türleri
│   └── ui.ts            # UI component props türleri
├── activities/           # Aktivite domain'i
│   ├── index.ts
│   ├── api.ts
│   └── ui.ts
├── tasks/               # Görev domain'i
│   ├── index.ts
│   ├── api.ts
│   └── ui.ts
└── users/               # Kullanıcı domain'i
    ├── index.ts
    ├── api.ts
    └── ui.ts
```

## 🏗️ Mimari İlkeleri

### 1. **Domain Bazlı Ayrım**
- Her business domain için ayrı klasör
- İlgili türlerin bir arada bulunması
- Kolay bakım ve genişletme

### 2. **API vs UI Ayrımı**
- `api.ts`: Backend API'si ile ilgili türler
  - DTO'lar (Data Transfer Objects)
  - Request/Response türleri
  - Enum değerleri
- `ui.ts`: Frontend UI ile ilgili türler
  - Component props
  - Form değerleri
  - UI state türleri

### 3. **Merkezi Export**
- Her domain'in `index.ts` dosyası tüm türleri export eder
- Ana `types/index.ts` tüm domain'leri birleştirir
- Import'ları kolaylaştırır

## 📝 Kullanım Örnekleri

### Tek Domain Import
```typescript
import { ProjectDto, ProjectStatus } from '@/types/projects';
import { ActivityFormValues } from '@/types/activities';
```

### Çoklu Domain Import
```typescript
import {
  ProjectDto,
  ActivityDto,
  UserDto,
  ApiResponse
} from '@/types';
```

### Common Types Import
```typescript
import { BaseEntity, PaginatedResponse, FormMode } from '@/types/common';
```

## 🔧 Eklenmesi Gerekenler

### 1. **Path Mapping**
`tsconfig.json` veya `vite.config.ts`'de path mapping ekleyin:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/types": ["src/types"],
      "@/types/*": ["src/types/*"]
    }
  }
}
```

### 2. **ESLint Kuralları**
TypeScript için ESLint kuralları ekleyin:

```json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

## 🚀 Genişletme

Yeni bir domain eklemek için:

1. `src/types/[domain]/` klasörü oluşturun
2. `api.ts` ve `ui.ts` dosyaları oluşturun
3. `index.ts` ile export'ları birleştirin
4. Ana `types/index.ts`'e domain'i ekleyin

## 📋 Best Practices

- **Type-only imports**: `import type { UserDto } from '@/types'`
- **Generic types**: API response'lar için generic kullanın
- **Enum'lar**: String enum'lar yerine const enum kullanın
- **Optional properties**: API'den gelebilecek optional alanlar için `?` kullanın
- **Union types**: Birden fazla tür kabul eden alanlar için union type kullanın
- **Interface extension**: Base interface'lerden türetme yapın

## 🔍 Örnekler

### API Response Type
```typescript
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}
```

### Form Values Type
```typescript
export interface ProjectFormValues {
  title: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
}
```

### Component Props Type
```typescript
export interface ProjectModalProps {
  visible: boolean;
  onClose: () => void;
  projectData?: ProjectDto;
  mode?: FormMode;
}
```