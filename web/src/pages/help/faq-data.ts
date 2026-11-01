export type FaqCategory = '설치·사용' | '개인정보 보호' | '계정·요금';

export type FaqItem = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
};

export const FAQ_CATEGORIES: readonly FaqCategory[] = ['설치·사용', '개인정보 보호', '계정·요금'];

/**
 * 첫 번째 답변만 Figma 시안에 있고, 나머지는 랜딩 페이지 문구를 바탕으로 쓴 초안이다.
 * 실제 서비스 정책에 맞게 기획에서 확인 후 수정해야 한다.
 */
export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: 'install',
    category: '설치·사용',
    question: 'Eveil은 어떻게 설치하나요?',
    answer:
      '크롬 웹스토어에서 "Eveil"을 검색해 [Chrome에 추가]를 누르면 끝이에요. 회원가입 없이 바로 ChatGPT에서 작동합니다.',
  },
  {
    id: 'setup',
    category: '설치·사용',
    question: '설치 후 따로 설정해야 하나요?',
    answer:
      '따로 설정하지 않아도 바로 작동해요. 브라우저 오른쪽 위 퍼즐 아이콘에서 Eveil을 고정해 두면 보호 상태를 언제든 확인할 수 있어요.',
  },
  {
    id: 'restore',
    category: '설치·사용',
    question: '가려진 정보가 답변에서 복원되지 않아요.',
    answer:
      '같은 대화 창에서 받은 답변만 원래 정보로 되돌려 보여 드려요. 페이지를 새로고침했거나 대화가 끝난 뒤라면 복원되지 않을 수 있어요. 계속 문제가 생기면 아래 1:1 문의로 알려 주세요.',
  },
  {
    id: 'server',
    category: '개인정보 보호',
    question: '제 원래 정보가 Eveil 서버로 전송되나요?',
    answer: '아니요. 원본은 내 브라우저 안에서만 처리되고, ChatGPT에는 가명으로 바꾼 내용만 전달돼요.',
  },
  {
    id: 'storage',
    category: '개인정보 보호',
    question: '치환 기록은 어디에 저장되나요?',
    answer: '가명과 원래 정보의 연결 기록은 내 브라우저에만 잠시 보관되고, 대화가 끝나면 자동으로 지워져요.',
  },
  {
    id: 'miss',
    category: '개인정보 보호',
    question: '감지를 놓치는 경우도 있나요?',
    answer:
      '형식이 특이한 정보는 놓칠 수 있어요. 보내기 전에 가려진 내용을 한 번 확인하고, 놓친 정보가 있으면 직접 가린 뒤 보내 주세요.',
  },
  {
    id: 'price',
    category: '계정·요금',
    question: '정말 무료인가요?',
    answer: '네, 회원가입 없이 무료로 쓸 수 있어요.',
  },
  {
    id: 'devices',
    category: '계정·요금',
    question: '다른 기기에서도 쓸 수 있나요?',
    answer:
      '크롬과 Edge, Whale 같은 크로미움 기반 브라우저라면 어디서든 쓸 수 있어요. 기기마다 확장 프로그램을 따로 설치해 주세요.',
  },
];
