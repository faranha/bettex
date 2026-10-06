/** @jsxImportSource react */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetDemoDashboardQueryKey, useRequestDemoProfileAvatar, useUpdateDemoProfile, type DemoDashboard } from '@workspace/api-client-react';
import { ImagePlus, RotateCcw } from 'lucide-react';
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
  const [bad, setBad] = useState(false);
  useEffect(() => { setBad(false); }, [path]);
  return <img src={bad ? mascotSrc() : avatarSrc(path)} onError={() => setBad(true)} width={size} height={size} alt="" aria-hidden="true"
    className={`shrink-0 rounded-full border border-[#E4DCCB] bg-[#F0E9DA] object-cover ${className}`} style={{ width: size, height: size }} />;
}

type Status = 'idle' | 'saving' | 'ok' | 'err';

export function ProfileIdentityEditor({ d }: { d: DemoDashboard }) {
  const { x } = useX();
  const qc = useQueryClient();
  const update = useUpdateDemoProfile();
  const request = useRequestDemoProfileAvatar();
  const [nick, setNick] = useState(d.profile.nickname ?? '');
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

  useEffect(() => { setNick(d.profile.nickname ?? ''); setTouched(false); setStatus('idle'); }, [id]);
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
      const res = await updateRef.current({ data: { name: d.profile.name, nickname, ...(avatarPath === undefined ? {} : { avatarPath }) } });
      if (!active()) return false;
      qc.setQueryData(getGetDemoDashboardQueryKey(), res);
      void qc.invalidateQueries({ queryKey: getGetDemoDashboardQueryKey() });
      setTouched(false); setStatus('ok'); setMsg(okText); return true;
    } catch { if (active()) { setStatus('err'); setMsg(fail); } return false; }
  };
  const nickValid = nick.trim().length <= 32;
  const onSave = (e: FormEvent) => {
    e.preventDefault();
    if (!nickValid || status === 'saving') return;
    void save(nick.trim(), undefined, x('Apelido salvo.', 'Nickname saved.', 'Apodo guardado.'));
  };
  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (fileRef.current) fileRef.current.value = '';
    if (!(TYPES as readonly string[]).includes(file.type)) { setStatus('err'); setMsg(x('Use uma imagem PNG, JPEG ou WebP.', 'Use a PNG, JPEG or WebP image.', 'Usa una imagen PNG, JPEG o WebP.')); return; }
    if (file.size < 1 || file.size > MAX) { setStatus('err'); setMsg(x('A imagem deve ter até 5 MB.', 'The image must be up to 5 MB.', 'La imagen debe pesar hasta 5 MB.')); return; }
    clearPreview();
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
  return <div className="mb-5 grid gap-4 rounded-2xl bg-[#F5F1E8] p-4 sm:grid-cols-[auto_1fr]" data-testid="profile-identity-editor">
    <div className="grid justify-items-center gap-2">
      {preview ? <img src={preview} alt="" width={96} height={96} className="h-24 w-24 rounded-full border border-[#E4DCCB] object-cover" data-testid="img-profile-preview" />
        : <ProfileAvatar path={d.profile.avatarPath} size={96} />}
    </div>
    <form className="grid min-w-0 gap-3" onSubmit={onSave}>
      <label className="grid gap-1 text-sm font-semibold">{x('Apelido', 'Nickname', 'Apodo')}
        <input data-testid="input-nickname" className={inp} maxLength={32} autoComplete="nickname" value={nick} aria-invalid={!nickValid} disabled={busy}
          onChange={e => { setNick(e.target.value); setTouched(true); if (status !== 'saving') setStatus('idle'); }} /></label>
      {!nickValid && <p role="alert" className="text-sm font-semibold text-[#B4421A]">{x('Use até 32 caracteres.', 'Use up to 32 characters.', 'Usa hasta 32 caracteres.')}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" data-testid="button-save-nickname" disabled={busy || !nickValid} className={btn}>{busy ? x('Salvando…', 'Saving…', 'Guardando…') : x('Salvar apelido', 'Save nickname', 'Guardar apodo')}</button>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" tabIndex={-1} data-testid="input-avatar-file" onChange={e => void onFile(e.target.files?.[0])} />
        <button type="button" data-testid="button-upload-avatar" disabled={busy} className={btn2} onClick={() => fileRef.current?.click()}><ImagePlus className="h-4 w-4" aria-hidden="true" />{x('Enviar foto', 'Upload picture', 'Subir foto')}</button>
        <button type="button" data-testid="button-restore-mascot" disabled={busy || !d.profile.avatarPath} className={btn2}
          onClick={() => { clearPreview(); void save(touched ? nick.trim() : (d.profile.nickname ?? ''), null, x('Mascote restaurado.', 'Mascot restored.', 'Mascota restaurada.')); }}><RotateCcw className="h-4 w-4" aria-hidden="true" />{x('Restaurar mascote', 'Restore mascot', 'Restaurar mascota')}</button>
      </div>
      <p className="text-xs text-[#5B6B85]">{x('PNG, JPEG ou WebP, até 5 MB.', 'PNG, JPEG or WebP, up to 5 MB.', 'PNG, JPEG o WebP, hasta 5 MB.')}</p>
      {msg && <p role={status === 'err' ? 'alert' : 'status'} data-testid="status-profile-identity" className={`text-sm font-semibold ${status === 'err' ? 'text-[#B4421A]' : 'text-[#0E7C6B]'}`}>{msg}</p>}
    </form>
  </div>;
}
export default ProfileIdentityEditor;
