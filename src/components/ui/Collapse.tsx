import { Collapse as MCollapse, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronRight } from '@tabler/icons-react';

export function Collapse({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [opened, { toggle }] = useDisclosure(!!open);
  return (
    <div className="mcol">
      <UnstyledButton className="mcol-head" onClick={toggle} aria-expanded={opened}>
        <IconChevronRight size={15} className="mcol-chev" data-open={opened || undefined} />
        <span>{title}</span>
      </UnstyledButton>
      <MCollapse in={opened}>
        <div className="mcol-body">{children}</div>
      </MCollapse>
    </div>
  );
}
