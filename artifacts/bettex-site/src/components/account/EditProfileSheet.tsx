/** @jsxImportSource react */
import type { ReactNode } from 'react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { Sheet } from '@/components/demo/fin';
import { useX } from '@/components/demo/ui';
import { ProfileIdentityEditor } from './ProfileIdentityEditor';

/** All profile edits enter through this dialog; the page itself stays read-only. */
export function EditProfileSheet({ open, onClose, d, children }: {
  open: boolean; onClose: () => void; d?: DemoDashboard; children?: ReactNode;
}) {
  const { x } = useX();
  return <Sheet open={open} onClose={onClose}
    title={x('Editar perfil', 'Edit profile', 'Editar perfil')}
    desc={x('Atualize seus dados e como você aparece no app.', 'Update your details and how you appear in the app.', 'Actualiza tus datos y cómo apareces en la app.')}>
    <div className="mt-4 grid min-w-0 gap-3">
      {open && (children ?? (d && <ProfileIdentityEditor key={d.profile.accountId} d={d} includeProfileFields onSaved={onClose} />))}
    </div>
  </Sheet>;
}
