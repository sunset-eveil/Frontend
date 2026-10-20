# Convention

## Git Convention

### Branch Name

```text
[타입]/설명
```

### Commit Message

```text
[타입]: 커밋 메시지
```

## Code Convention

### Naming

- 클래스와 타입: `PascalCase`
- 변수, 함수, 인스턴스: `camelCase`
- 읽기 전용 상수: `UPPER_SNAKE_CASE`
- Enum: `PascalCase`
- 파일명: `kebab-case`

Boolean 변수는 상태나 가능 여부가 드러나도록 `is`, `has`, `can`, `should` 접두사를 사용합니다.

### Type

#### 타입 선언

값의 타입이 명확한 단순 할당은 TypeScript의 타입 추론을 사용합니다. 함수의 반환 타입은 항상 명시합니다.

#### 안전한 타입 사용

`any`는 사용하지 않습니다. 타입을 미리 특정할 수 없는 값은 `unknown`으로 받은 후 타입을 확인합니다.

#### Type Alias

객체 구조를 포함한 모든 타입은 `interface` 대신 `type` 키워드로 선언합니다.
