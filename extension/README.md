# Eveil Frontend

## 실행

```bash
npm install
cp .env.example .env
npm run dev
```

`.env`에 마스킹 API 서버 주소와 발급받은 클라이언트 인증값을 입력하세요.

```dotenv
VITE_MASKING_API_BASE_URL=https://api.example.com
VITE_MASKING_CLIENT_ID=<등록된 UUID>
VITE_MASKING_AUTH_KEY=<Base64 인증 키>
VITE_MASKING_KEK=<32바이트 키를 Base64로 인코딩한 값>
```

입력 패널의 **가려서 보내기**는 `POST /api/chats/{chatId}/maskings`를 호출합니다. `chatId`는 브라우저 세션 동안 UUID로 유지됩니다. 성공 응답은 명세대로 `204 No Content`이며, 오류는 패널 아래에 표시됩니다.

비교 화면에서 텍스트를 선택해 직접 가리면 `PUT /api/chats/{chatId}/mappings`에 `{ "value": "선택한 값", "type": "유형 코드" }`를 보내고, 204 성공 후 비교 화면에 해당 매핑을 표시합니다.

직접 가린 항목을 해제하면 `DELETE /api/chats/{chatId}/mappings/{maskCode}`를 호출합니다. `maskCode`는 유형 코드와 현재 화면에서 계산한 번호를 붙여 구성합니다 (예: `NAME1`).

`excludeTypes`에는 비활성화한 유형을 대문자 코드로 전달합니다 (`NAME`, `PHONE`, `EMAIL`, `RESIDENT`, `PAYMENT`, `ADDRESS`, `AMOUNT`, `CUSTOM`). 모든 유형이 활성화된 경우 이 필드를 생략합니다.

Vite의 `VITE_` 환경 변수는 브라우저 번들에서 확인할 수 있습니다. 배포 환경에는 공개되어도 되는 클라이언트 자격 증명만 설정하세요.
