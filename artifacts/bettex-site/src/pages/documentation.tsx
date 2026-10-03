import { WhitepaperSection } from '@/components/WhitepaperSection';

export function DocumentationPage() {
  return <main><div className="bg-[#F4F1E8]"><div className="page-wrap pt-5"><a href={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/pitch`} className="mono inline-flex min-h-11 items-center text-[11px] font-bold uppercase tracking-[.1em] text-[#2B59FF] underline underline-offset-4">Ver o pitch do projeto</a></div></div><WhitepaperSection /></main>;
}

export default DocumentationPage;
