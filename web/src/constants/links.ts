export const CHATGPT_URL = 'https://chatgpt.com';

/** 크롬 웹스토어 등록 전까지는 비워 두고, 설치 버튼은 온보딩으로 이동시킨다. */
export const CHROME_WEB_STORE_URL = '';

/** 1:1 문의를 받을 메일 주소. web/.env 의 VITE_INQUIRY_EMAIL 로 설정한다. */
export const INQUIRY_EMAIL: string = import.meta.env.VITE_INQUIRY_EMAIL ?? '';
