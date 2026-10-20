import type { IconName } from './components/Icon';

export type MaskTypeId =
  | 'name'
  | 'phone'
  | 'email'
  | 'resident'
  | 'payment'
  | 'address'
  | 'amount'
  | 'custom';

export type MaskDefinition = {
  id: MaskTypeId;
  label: string;
  icon: IconName;
  chip: IconName;
  values: string[];
};

export type ManualMask = {
  id: string;
  start: number;
  end: number;
  text: string;
  type: MaskTypeId;
  label: string;
  remember: boolean;
};

export const EXAMPLE_TEXT = '이력서 자기소개 부분 좀 다듬어 줘.\n저는 김민지이고 010-2345-6789, minji.kim@mail.com 으로 연락받고 있어요.\n주소는 서울 마포구 월드컵로 12 이고, 희망 연봉은 4,200만원이야.\n지금은 다운랩스에서 3년째 일하고 있어요.';

export const MASK_DEFINITIONS: MaskDefinition[] = [
  {
    id: 'name',
    label: '이름',
    icon: 'user',
    chip: 'userChip',
    values: ['김민지'],
  },
  {
    id: 'phone',
    label: '전화번호',
    icon: 'phone',
    chip: 'phoneChip',
    values: ['010-2345-6789'],
  },
  {
    id: 'email',
    label: '이메일',
    icon: 'email',
    chip: 'emailChip',
    values: ['minji.kim@mail.com'],
  },
  {
    id: 'resident',
    label: '주민등록번호',
    icon: 'id',
    chip: 'id',
    values: [],
  },
  {
    id: 'payment',
    label: '계좌·카드번호',
    icon: 'card',
    chip: 'card',
    values: [],
  },
  {
    id: 'address',
    label: '주소',
    icon: 'pin',
    chip: 'pinChip',
    values: ['서울 마포구 월드컵로 12'],
  },
  {
    id: 'amount',
    label: '금액',
    icon: 'coins',
    chip: 'coinsChip',
    values: ['4,200만원'],
  },
  {
    id: 'custom',
    label: '기타',
    icon: 'more',
    chip: 'more',
    values: [],
  },
];
