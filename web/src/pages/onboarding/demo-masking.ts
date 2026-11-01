/**
 * 온보딩 '직접 체험' 단계에서만 쓰는 간단한 연습용 감지기.
 * 실제 마스킹은 확장 프로그램이 담당하고, 여기서는 흐름을 보여 주는 용도다.
 */

export type DemoSegment = { kind: 'text'; value: string } | { kind: 'token'; value: string };

type Match = { start: number; end: number; label: string };

type DemoRule = {
  label: string;
  pattern: RegExp;
  /** 패턴 안에서 실제로 가릴 부분의 캡처 그룹 번호. 없으면 전체를 가린다. */
  group?: number;
};

const NAME_PARTICLE = '(?:이야|야|입니다|이에요|예요|이고|이랑|랑|에게|한테|님|씨|이|은|는|가|을|를|의|도|와|과)';

const DEMO_RULES: readonly DemoRule[] = [
  { label: '이메일', pattern: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g },
  { label: '주민번호', pattern: /\d{6}-?[1-4]\d{6}/g },
  { label: '전화번호', pattern: /01[016789]-?\d{3,4}-?\d{4}/g },
  { label: '카드번호', pattern: /\d{4}-\d{4}-\d{4}-\d{4}/g },
  {
    label: '이름',
    pattern: new RegExp(`(?:이름은|이름:|저는|나는)\\s*([가-힣]{2,3}?)(?=${NAME_PARTICLE}?(?:[^가-힣]|$))`, 'g'),
    group: 1,
  },
];

/** 흔한 한국 성씨. '성 + 두 글자' 낱말을 이름 후보로 본다. */
const SURNAMES = new Set(
  '김이박최정강조윤장임한오서신권황안송류유전홍고문양손배백허남심노하곽성차주우구민진나지엄채원천방공현함변염여추도소석선설마길연위표명기반왕금옥육인맹제모탁국어은편용'.split(
    '',
  ),
);

/** 성씨로 시작하지만 이름이 아닌 흔한 세 글자 낱말 */
const NOT_NAMES = new Set([
  '이름은',
  '이름이',
  '이름을',
  '이름도',
  '이메일',
  '이야기',
  '이번에',
  '이제는',
  '이렇게',
  '이런데',
  '정말로',
  '정도로',
  '조금만',
  '조금씩',
  '주민번',
  '전화번',
  '한국어',
  '하나로',
  '하나만',
  '안녕히',
  '안녕하',
  '고마워',
  '고맙다',
  '문제가',
  '문의를',
  '방법이',
  '오늘도',
  '오랜만',
  '여기서',
  '도와줘',
  '도움이',
  '우리가',
  '우리는',
  '나중에',
  '지금은',
  '진짜로',
  '연락처',
  '주소는',
  '서울시',
  '남자친',
]);

const HANGUL_WORD = /[가-힣]+/g;
const TRAILING_PARTICLE = new RegExp(`^([가-힣]{3})${NAME_PARTICLE}?$`);

/** 문맥 없이 '김민지'처럼 이름만 적어도 잡아낸다. */
function findStandaloneNames(text: string): Match[] {
  const matches: Match[] = [];

  for (const word of text.matchAll(HANGUL_WORD)) {
    const core = TRAILING_PARTICLE.exec(word[0])?.[1];
    if (word.index === undefined || core === undefined) {
      continue;
    }
    if (SURNAMES.has(core.charAt(0)) && !NOT_NAMES.has(core)) {
      matches.push({ start: word.index, end: word.index + core.length, label: '이름' });
    }
  }

  return matches;
}

function findMatches(text: string): Match[] {
  const matches: Match[] = [];
  const add = (candidate: Match): void => {
    const overlaps = matches.some((match) => candidate.start < match.end && candidate.end > match.start);
    if (!overlaps) {
      matches.push(candidate);
    }
  };

  for (const { label, pattern, group } of DEMO_RULES) {
    for (const result of text.matchAll(pattern)) {
      const target = group === undefined ? result[0] : result[group];
      if (result.index === undefined || target === undefined) {
        continue;
      }
      const start = result.index + result[0].indexOf(target);
      add({ start, end: start + target.length, label });
    }
  }
  findStandaloneNames(text).forEach(add);

  return matches.sort((a, b) => a.start - b.start);
}

export function maskDemoText(text: string): { segments: DemoSegment[]; count: number } {
  const matches = findMatches(text);
  const counters = new Map<string, number>();
  /** 같은 정보는 같은 가명으로 바꾼다 (김민지가 두 번 나오면 둘 다 이름_1). */
  const tokens = new Map<string, string>();
  const segments: DemoSegment[] = [];
  let cursor = 0;

  for (const { start, end, label } of matches) {
    if (start > cursor) {
      segments.push({ kind: 'text', value: text.slice(cursor, start) });
    }
    const original = `${label}:${text.slice(start, end)}`;
    let token = tokens.get(original);
    if (token === undefined) {
      const order = (counters.get(label) ?? 0) + 1;
      counters.set(label, order);
      token = `${label}_${order}`;
      tokens.set(original, token);
    }
    segments.push({ kind: 'token', value: token });
    cursor = end;
  }

  if (cursor < text.length) {
    segments.push({ kind: 'text', value: text.slice(cursor) });
  }

  return { segments, count: tokens.size };
}
