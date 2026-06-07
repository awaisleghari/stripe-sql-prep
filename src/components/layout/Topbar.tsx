import styles from './AppLayout.module.css';

export function Topbar({ title, readiness }: { title: string; readiness: number }) {
  return (
    <header className={styles.topbar}>
      <strong style={{ fontSize: 15 }}>{title}</strong>
      <div className={styles.ring}>
        Interview readiness
        <span className={styles.ringval}>{readiness}%</span>
      </div>
    </header>
  );
}
