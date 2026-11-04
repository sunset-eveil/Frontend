# Eveil Frontend

## 실행

```bash
npm install
cp .env.example .env
npm run dev
```

프로젝트 루트의 `.env.local`에 API 주소만 설정합니다.

```dotenv
VITE_API_BASE_URL=https://localhost:8443/api
```

등록 화면에서 패스프레이즈를 입력하면 인증값이 생성됩니다. 인증 키와 KEK를 `VITE_` 환경변수에 넣지 마세요.
`/api`가 없는 기존 서버 주소도 호환됩니다.

로컬 HTTPS 미리보기는 `DEV_TLS_CERT`, `DEV_TLS_KEY`에 인증서의 절대 경로를 설정한 뒤
`npm run dev:extension`으로 실행합니다 (https://localhost:5174).
실제 등록과 마스킹은 Chrome 확장 프로그램에서 테스트합니다.
`npm run build --workspace=@eveil/extension` 후 `extension/dist`를 압축 해제된 확장 프로그램으로 로드하세요.

입력 패널의 **가려서 보내기**는 `POST /api/chats/{chatId}/maskings`를 호출합니다. `chatId`는 브라우저 세션 동안 UUID로 유지됩니다. 성공 응답은 명세대로 `204 No Content`이며, 오류는 패널 아래에 표시됩니다.

비교 화면에서 텍스트를 선택해 직접 가리면 `PUT /api/chats/{chatId}/mappings`에 `{ "value": "선택한 값", "type": "유형 코드" }`를 보내고, 204 성공 후 비교 화면에 해당 매핑을 표시합니다.

직접 가린 항목을 해제하면 `DELETE /api/chats/{chatId}/mappings/{maskCode}`를 호출합니다. `maskCode`는 유형 코드와 현재 화면에서 계산한 번호를 붙여 구성합니다 (예: `NAME1`).

`excludeTypes`에는 비활성화한 유형을 대문자 코드로 전달합니다 (`NAME`, `PHONE`, `EMAIL`, `RRN`, `CARD_ACCOUNT`, `ADDRESS`, `AMOUNT`, `ETC`). 모든 유형이 활성화된 경우 이 필드를 생략합니다.

Vite의 `VITE_` 환경 변수는 브라우저 번들에서 확인할 수 있습니다. 인증 키, KEK, Redis 및 인증서 비밀번호를 설정하지 마세요.


## ChatGPT 입력창에서 사용

빌드 후 `chrome://extensions`에서 Eveil의 새로고침 버튼을 누르고 ChatGPT 탭도 새로고침하세요.
ChatGPT 입력창의 EVEIL 버튼을 누르면 입력창 위에 등록/마스킹 패널이 열립니다.
도구 모음의 확장 아이콘도 같은 패널을 여닫으며 별도 팝업은 열지 않습니다.
패널의 닫기 버튼, Esc 키, 또는 바깥 영역 클릭으로 닫을 수 있습니다.
첫 사용 안내는 '알겠어요' 또는 EVEIL을 누르면 사라집니다.
