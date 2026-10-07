/** @jsxImportSource react */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetDemoDashboardQueryKey, useRequestDemoProfileAvatar, useUpdateDemoProfile, type DemoDashboard } from '@workspace/api-client-react';
import { ImagePlus, RotateCcw, UserRound } from 'lucide-react';
import { avatarRetryPlan } from './profile-avatar-retry';
import { useX } from '@/components/demo/ui';
import { inp } from '@/components/demo/fin';

const TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
const MAX = 5 * 1024 * 1024;
const btn2 = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0E7C6B] bg-white px-4 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B]';
const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white hover:bg-[#0A6657] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B]';

export const mascotSrc = () => `${import.meta.env.BASE_URL}app/hydra-transparent.webp`;
export function avatarSrc(path?: string | null): string {
  const m = path?.match(/^\/objects\/uploads\/([A-Za-z0-9-]+)$/);
  return m ? `/api/profile-pictures/${m[1]}` : mascotSrc();
}

export function ProfileAvatar({ path, size = 40, className = '' }: { path?: string | null; size?: number; className?: string }) {
  const initial = avatarSrc(path);
  const [source, setSource] = useState(initial);
  const [unavailable, setUnavailable] = useState(false);
  const attempts = useRef(0);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (pending.current) clearTimeout(pending.current);
    pending.current = null;
    attempts.current = 0;
    setUnavailable(false);
    setSource(initial);
    return () => { if (pending.current) clearTimeout(pending.current); };
  }, [initial]);
  const classes = `shrink-0 rounded-full border border-[#E4DCCB] bg-[#F0E9DA] ${className}`;
  const style = { width: size, height: size };
  if (unavailable) return <span className={`inline-flex items-center justify-center text-[#5B6B85] ${classes}`} style={style} aria-hidden="true"><UserRound style={{ width: size * .5, height: size * .5 }} /></span>;
  return <img src={source} onError={() => {
    if (pending.current) return;
    const fallback = mascotSrc();
    if (source === initial && initial !== fallback) { setSource(fallback); return; }
    const retry = avatarRetryPlan(fallback, attempts.current++, Date.now());
    if (!retry) { setUnavailable(true); return; }
    pending.current = setTimeout(() => { pending.current = null; setSource(retry.src); }, retry.delayMs);
  }} width={size} height={size} alt="" aria-hidden="true" className={`object-cover ${classes}`} style={style} />;
}

type Status = 'idle' | 'saving' | 'ok' | 'err';

export function ProfileIdentitySummary({ d }: { d: DemoDashboard }) {
  const { x } = useX();
  return <div className="mb-5 flex min-w-0 items-center gap-4 rounded-2xl bg-[#F5F1E8] p-4" data-testid="profile-identity-summary">
    <ProfileAvatar path={d.profile.avatarPath} size={80} />
    <div className="min-w-0">
      <p className="text-xs font-semibold text-[#5B6B85]">{x('Apelido', 'Nickname', 'Apodo')}</p>
      <p className="break-all text-sm font-bold" data-testid="text-profile-nickname">{d.profile.nickname}</p>
      <p className="mt-2 text-xs leading-relaxed text-[#5B6B85]">{x('Privado agora. Visível publicamente no futuro.', 'Private now. Publicly visible in the future.', 'Privado ahora. Visible públicamente en el futuro.')}</p>
    </div>
  </div>;
}

export function ProfileIdentityEditor({ d, includeProfileFields = false, onSaved }: { d: DemoDashboard; includeProfileFields?: boolean; onSaved?: () => void }) {
  const { x } = useX();
  const qc = useQueryClient();
  const update = useUpdateDemoProfile();
  const request = useRequestDemoProfileAvatar();
  const [nick, setNick] = useState(d.profile.nickname ?? '');
  const [name, setName] = useState(d.profile.name);
  const [email, setEmail] = useState(d.profile.email);
  const [draftAvatar, setDraftAvatar] = useState<string | null | undefined>(undefined);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [msg, setMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const id = d.profile.accountId;
  const activeAccount = useRef(id); activeAccount.current = id;
  const mounted = useRef(true);
  const uploadController = useRef<AbortController | null>(null);
  const updateRef = useRef(update.mutateAsync); updateRef.current = update.mutateAsync;
  const requestRef = useRef(request.mutateAsync); requestRef.current = request.mutateAsync;

  useEffect(() => { setNick(d.profile.nickname ?? ''); setName(d.profile.name); setEmail(d.profile.email); setDraftAvatar(undefined); setTouched(false); setStatus('idle'); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  // Server refreshes only update the draft while the user has not edited it.
  useEffect(() => { if (!touched) setNick(d.profile.nickname ?? ''); }, [d.profile.nickname, touched]);
  const clearPreview = () => { if (previewRef.current) URL.revokeObjectURL(previewRef.current); previewRef.current = null; setPreview(null); };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      uploadController.current?.abort();
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);
  const active = () => mounted.current && activeAccount.current === id;

  const fail = x('Não foi possível salvar. Tente de novo.', 'Could not save. Try again.', 'No se pudo guardar. Intenta de nuevo.');
  const save = async (nickname: string, avatarPath: string | null | undefined, okText: string) => {
    if (!active()) return false;
    setStatus('saving'); setMsg('');
    try {
      const res = await updateRef.current({ data: {
        name: includeProfileFields ? name.trim() : d.profile.name,
        ...(includeProfileFields ? { email: email.trim() } : {}),
        nickname, ...(avatarPath === undefined ? {} : { avatarPath }),
      } });
      if (!active()) return false;
      qc.setQueryData(getGetDemoDashboardQueryKey(), res);
      void qc.invalidateQueries({ queryKey: getGetDemoDashboardQueryKey() });
      setTouched(false); setStatus('ok'); setMsg(okText); onSaved?.(); return true;
    } catch { if (active()) { setStatus('err'); setMsg(fail); } return false; }
  };
  const nickValid = nick.trim().length > 0 && nick.trim().length <= 32;
  const profileValid = !includeProfileFields || (name.trim().length >= 2 && name.trim().length <= 60 && email.trim().length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
  const onSave = (e: FormEvent) => {
    e.preventDefault();
    if (!nickValid || !profileValid || status === 'saving') return;
    void save(nick.trim(), includeProfileFields ? draftAvatar : undefined, x('Alterações salvas.', 'Changes saved.', 'Cambios guardados.'));
  };
  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (fileRef.current) fileRef.current.value = '';
    if (!(TYPES as readonly string[]).includes(file.type)) { setStatus('err'); setMsg(x('Use uma imagem PNG, JPEG ou WebP.', 'Use a PNG, JPEG or WebP image.', 'Usa una imagen PNG, JPEG o WebP.')); return; }
    if (file.size < 1 || file.size > MAX) { setStatus('err'); setMsg(x('A imagem deve ter até 5 MB.', 'The image must be up to 5 MB.', 'La imagen debe pesar hasta 5 MB.')); return; }
    clearPreview();
    if (includeProfileFields) setDraftAvatar(undefined);
    const controller = new AbortController();
    uploadController.current = controller;
    const url = URL.createObjectURL(file); previewRef.current = url; setPreview(url);
    setStatus('saving'); setMsg('');
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (image.naturalWidth * image.naturalHeight > 25_000_000) throw new Error('image_too_large');
      if (!active()) return;
      const up = await requestRef.current({ data: { size: file.size, contentType: file.type as typeof TYPES[number] } });
      if (!active()) return;
      const put = await fetch(up.uploadURL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file, signal: controller.signal });
      if (!put.ok) throw new Error('upload');
      if (!active()) return;
      if (includeProfileFields) {
        setDraftAvatar(up.objectPath); setStatus('idle');
        setMsg(x('Foto pronta. Salve as alterações para aplicá-la.', 'Picture ready. Save changes to apply it.', 'Foto lista. Guarda los cambios para aplicarla.'));
        return;
      }
      // Keep the draft nickname only if the user edited it; otherwise keep the saved one.
      const ok = await save(touched ? nick.trim() : (d.profile.nickname ?? ''), up.objectPath, x('Foto atualizada.', 'Picture updated.', 'Foto actualizada.'));
      if (!ok) clearPreview(); else window.setTimeout(clearPreview, 0);
    } catch {
      if (!active()) return;
      clearPreview(); setStatus('err');
      setMsg(x('Não foi possível enviar a foto. A anterior foi mantida.', 'Could not upload the picture. The previous one was kept.', 'No se pudo subir la foto. Se mantuvo la anterior.'));
    }
  };
  const busy = status === 'saving';
  const displayedAvatar = draftAvatar === undefined ? d.profile.avatarPath : draftAvatar;
  return <div className="mb-5 grid gap-4 rounded-2xl bg-[#F5F1E8] p-4 sm:grid-cols-[auto_1fr]" data-testid="profile-identity-editor">
    <div className="grid justify-items-center gap-2">
      {preview ? <img src={preview} alt="" width={96} height={96} className="h-24 w-24 rounded-full border border-[#E4DCCB] object-cover" data-testid="img-profile-preview" />
        : <ProfileAvatar path={displayedAvatar} size={96} />}
    </div>
    <form className="grid min-w-0 gap-3" onSubmit={onSave}>
      {includeProfileFields && <>
        <label className="grid gap-1 text-sm font-semibold">{x('Nome', 'Name', 'Nombre')}<input data-testid="input-name" className={inp} autoComplete="name" required minLength={2} maxLength={60} disabled={busy} value={name} onChange={e => { setName(e.target.value); setStatus('idle'); }} /></label>
        <label className="grid gap-1 text-sm font-semibold">{x('E-mail', 'Email', 'Correo electrónico')}<input data-testid="input-profile-email" type="email" autoComplete="email" required maxLength={254} disabled={busy} className={inp} value={email} onChange={e => { setEmail(e.target.value); setStatus('idle'); }} /></label>
      </>}
      <label className="grid gap-1 text-sm font-semibold">{x('Apelido', 'Nickname', 'Apodo')}
        <input data-testid="input-nickname" className={inp} maxLength={32} autoComplete="nickname" value={nick} aria-describedby="nickname-privacy" aria-invalid={!nickValid} disabled={busy}
          onChange={e => { setNick(e.target.value); setTouched(true); if (status !== 'saving') setStatus('idle'); }} /></label>
      <p id="nickname-privacy" data-testid="nickname-privacy" className="text-xs leading-relaxed text-[#5B6B85]">{x('Seu apelido é gerado automaticamente. Você pode substituí-lo pelo seu próprio apelido. Ele é privado agora, mas ficará visível publicamente no futuro.', 'Your nickname is generated automatically. You can replace it with your own. It is private now, but will be publicly visible in the future.', 'Tu apodo se genera automáticamente. Puedes sustituirlo por el tuyo. Es privado ahora, pero será visible públicamente en el futuro.')}</p>
      {!nickValid && <p role="alert" className="text-sm font-semibold text-[#B4421A]">{x('Use de 1 a 32 caracteres.', 'Use 1 to 32 characters.', 'Usa de 1 a 32 caracteres.')}</p>}
      <div className="flex flex-wrap gap-2">
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" tabIndex={-1} data-testid="input-avatar-file" onChange={e => void onFile(e.target.files?.[0])} />
        <button type="button" data-testid="button-upload-avatar" disabled={busy} className={btn2} onClick={() => fileRef.current?.click()}><ImagePlus className="h-4 w-4" aria-hidden="true" />{x('Enviar foto', 'Upload picture', 'Subir foto')}</button>
        <button type="button" data-testid="button-restore-mascot" disabled={busy || !displayedAvatar} className={btn2}
          onClick={() => {
            clearPreview();
            if (includeProfileFields) { setDraftAvatar(null); setStatus('idle'); setMsg(''); }
            else void save(touched ? nick.trim() : (d.profile.nickname ?? ''), null, x('Mascote restaurado.', 'Mascot restored.', 'Mascota restaurada.'));
          }}><RotateCcw className="h-4 w-4" aria-hidden="true" />{x('Restaurar mascote', 'Restore mascot', 'Restaurar mascota')}</button>
      </div>
      <p className="text-xs text-[#5B6B85]">{x('PNG, JPEG ou WebP, até 5 MB.', 'PNG, JPEG or WebP, up to 5 MB.', 'PNG, JPEG o WebP, hasta 5 MB.')}</p>
      {msg && <p role={status === 'err' ? 'alert' : 'status'} data-testid="status-profile-identity" className={`text-sm font-semibold ${status === 'err' ? 'text-[#B4421A]' : 'text-[#0E7C6B]'}`}>{msg}</p>}
      <button type="submit" data-testid={includeProfileFields ? 'button-save-name' : 'button-save-nickname'} disabled={busy || !nickValid || !profileValid} className={btn}>{busy ? x('Salvando…', 'Saving…', 'Guardando…') : x('Salvar alterações', 'Save changes', 'Guardar cambios')}</button>
    </form>
  </div>;
}
export default ProfileIdentityEditor;
