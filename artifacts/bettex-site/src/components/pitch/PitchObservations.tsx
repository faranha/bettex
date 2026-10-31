import type { ReactNode } from 'react';
import { t } from '../../lib/i18n';
import './PitchObservations.css';

export function PitchObservations({ children, dark = false, id }: { children: ReactNode; dark?: boolean; id?: string }) {
  return <footer id={id} className={`pitch-observations${dark ? ' pitch-observations--dark' : ''}`} aria-label={t('Observações')}>{children}</footer>;
}