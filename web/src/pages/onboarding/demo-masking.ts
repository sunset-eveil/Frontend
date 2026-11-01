/**
 * 온보딩 '직접 체험' 단계에서만 쓰는 간단한 연습용 감지기.
 * 실제 마스킹은 확장 프로그램이 담당하고, 여기서는 흐름을 보여 주는 용도다.
 */

export type DemoSegment = { kind: 'text'; value: string } | { kind: 'token'; value: string };

type DemoRule = {
  label: string;
  pattern: RegExp;
  /** 패턴 안에서 실제로 가릴 부분의 캡처 그룹 번호. 없으면 전체를 가린다. */
  group?: number;
};

const DEMO_RULES: readonly DemoRule[] = [
  { label: '이메일', pattern: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g },
  { label: '주민번호', pattern: /\d{6}-?[1-4]\d{6}/g },
  { label: '전화번호', pattern: /01[016789]-?\d{3,4}-?\d{4}/g },
  { label: '카드번호', pattern: /\d{4}-\d{4}-\d{4}-\d{4}/g },
  {
    label: '이름',
    pattern: /(?:이름은|이름:|저는|나는)\s*([가-힣]{2,3}?)(?=(?:이야|야|입니다|이에요|예요|이고|고|이|은|는|가)?(?:[,.!?\s]|$))/g,
    group: 1,
  },
];

type Match = { start: number; end: number; label: string };

function findMatches(text: string): Match[] {
  const matches: Match[] = [];

  for (const { label, pattern, group } of DEMO_RULES) {
    for (const result of text.matchAll(pattern)) {
      const target = group === undefined ? result[0] : result[group];
      if (result.index === undefined || target === undefined) {
        continue;
      }
      const start = result.index + result[0].indexOf(target);
      const end = start + target.length;
      const overlaps = matches.some((match) => start < match.end && end > match.start);
      if (!overlaps) {
        matches.push({ start, end, label });
      }
    }
  }

  return matches.sort((a, b) => a.start - b.start);
}

export function maskDemoText(text: string): { segments: DemoSegment[]; count: number } {
  const matches = findMatches(text);
  const counters = new Map<string, number>();
  const segments: DemoSegment[] = [];
  let cursor = 0;

  for (const { start, end, label } of matches) {
    if (start > cursor) {
      segments.push({ kind: 'text', value: text.slice(cursor, start) });
    }
    const order = (counters.get(label) ?? 0) + 1;
    counters.set(label, order);
    segments.push({ kind: 'token', value: `${label}_${order}` });
    cursor = end;
  }

  if (cursor < text.length) {
    segments.push({ kind: 'text', value: text.slice(cursor) });
  }

  return { segments, count: matches.length };
}
