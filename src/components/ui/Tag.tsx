import type { TagColor } from '@/types';

export function Tag({ color = 'grey', children }: { color?: TagColor; children: React.ReactNode }) {
  return <span className={`tag ${color}`}>{children}</span>;
}
