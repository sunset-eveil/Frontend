import type { IconName } from "./components/Icon";

export type MaskTypeId =
  | "name"
  | "phone"
  | "email"
  | "resident"
  | "payment"
  | "address"
  | "custom";

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

export const MASK_DEFINITIONS: MaskDefinition[] = [
  {
    id: "name",
    label: "이름",
    icon: "user",
    chip: "userChip",
    values: ["이진서"],
  },
  {
    id: "phone",
    label: "전화번호",
    icon: "phone",
    chip: "phoneChip",
    values: ["010-2345-6789"],
  },
  {
    id: "email",
    label: "이메일",
    icon: "email",
    chip: "emailChip",
    values: ["jinseo.lee@example.com"],
  },
  {
    id: "resident",
    label: "주민등록번호",
    icon: "id",
    chip: "id",
    values: ["050101-3123456"],
  },
  {
    id: "payment",
    label: "계좌·카드번호",
    icon: "card",
    chip: "card",
    values: ["110-123-456789", "1234-5678-9012-3456"],
  },
  {
    id: "address",
    label: "주소",
    icon: "pin",
    chip: "pinChip",
    values: ["대전광역시 유성구 가정북로 76"],
  },
  {
    id: "custom",
    label: "기타",
    icon: "more",
    chip: "more",
    values: ["2학년 1반 1번"],
  },
];
