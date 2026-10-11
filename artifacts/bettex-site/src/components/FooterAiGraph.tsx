/** @jsxImportSource react */
import { useId } from 'react';

/** Decorative luminous AI graph for the footer CTA. Pure SVG, aria-hidden. */
export function FooterAiGraph() {
  const id = useId().replace(/:/g, '');
  return <svg className="footer-ai" viewBox="0 0 640 420" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id={`${id}c`}><stop offset="0" stopColor="#fff6d6" /><stop offset=".35" stopColor="#F2B632" /><stop offset="1" stopColor="#F2B632" stopOpacity="0" /></radialGradient>
      <radialGradient id={`${id}n`}><stop offset="0" stopColor="#eaf2ff" stopOpacity=".85" /><stop offset="1" stopColor="#9fc0ff" stopOpacity=".65" /></radialGradient>
    </defs>
    <line className="footer-ai__link footer-ai__link--core" x1="380" y1="210" x2="200" y2="90" />
    <line className="footer-ai__link footer-ai__link--core" x1="380" y1="210" x2="230" y2="330" />
    <line className="footer-ai__link footer-ai__link--core" x1="380" y1="210" x2="520" y2="70" />
    <line className="footer-ai__link footer-ai__link--core" x1="380" y1="210" x2="560" y2="200" />
    <line className="footer-ai__link footer-ai__link--core" x1="380" y1="210" x2="520" y2="350" />
    <line className="footer-ai__link footer-ai__link--core" x1="380" y1="210" x2="450" y2="130" />
    <line className="footer-ai__link footer-ai__link--core" x1="380" y1="210" x2="300" y2="250" />
    <line className="footer-ai__link footer-ai__link--core" x1="380" y1="210" x2="470" y2="280" />
    <line className="footer-ai__link" x1="200" y1="90" x2="330" y2="40" />
    <line className="footer-ai__link" x1="330" y1="40" x2="520" y2="70" />
    <line className="footer-ai__link" x1="520" y1="70" x2="560" y2="200" />
    <line className="footer-ai__link" x1="560" y1="200" x2="520" y2="350" />
    <line className="footer-ai__link" x1="520" y1="350" x2="400" y2="385" />
    <line className="footer-ai__link" x1="400" y1="385" x2="230" y2="330" />
    <line className="footer-ai__link" x1="230" y1="330" x2="300" y2="250" />
    <line className="footer-ai__link" x1="200" y1="90" x2="110" y2="210" />
    <line className="footer-ai__link" x1="110" y1="210" x2="230" y2="330" />
    <line className="footer-ai__link" x1="450" y1="130" x2="520" y2="70" />
    <line className="footer-ai__link" x1="300" y1="250" x2="470" y2="280" />
    <line className="footer-ai__link" x1="470" y1="280" x2="520" y2="350" />
    <line className="footer-ai__link" x1="450" y1="130" x2="560" y2="200" />
    <circle cx="380" cy="210" r="120" fill={`url(#${id}c)`} className="footer-ai__halo" opacity=".18" />
    <circle cx="380" cy="210" r="46" className="footer-ai__ring" /><circle cx="380" cy="210" r="30" fill="#070B1F" stroke="#F2B632" strokeWidth="1.1" />
    <text x="380" y="214" textAnchor="middle" className="footer-ai__label">BETTEX</text>
    <circle cx="200" cy="90" r="28.5" fill="#9fc0ff" opacity=".18" className="footer-ai__pulse" style={{ animationDelay: "0.0s" }} /><circle cx="200" cy="90" r="15" fill={`url(#${id}n)`} stroke="#2B59FF" strokeWidth="2" />
    <circle cx="230" cy="330" r="24.7" fill="#9fc0ff" opacity=".18" className="footer-ai__pulse" style={{ animationDelay: "0.3s" }} /><circle cx="230" cy="330" r="13" fill={`url(#${id}n)`} stroke="#2B59FF" strokeWidth="2" />
    <circle cx="520" cy="70" r="26.599999999999998" fill="#9fc0ff" opacity=".18" className="footer-ai__pulse" style={{ animationDelay: "0.6s" }} /><circle cx="520" cy="70" r="14" fill={`url(#${id}n)`} stroke="#2B59FF" strokeWidth="2" />
    <circle cx="560" cy="200" r="22.799999999999997" fill="#9fc0ff" opacity=".18" className="footer-ai__pulse" style={{ animationDelay: "0.9s" }} /><circle cx="560" cy="200" r="12" fill={`url(#${id}n)`} stroke="#2B59FF" strokeWidth="2" />
    <circle cx="520" cy="350" r="28.5" fill="#9fc0ff" opacity=".18" className="footer-ai__pulse" style={{ animationDelay: "1.2s" }} /><circle cx="520" cy="350" r="15" fill={`url(#${id}n)`} stroke="#2B59FF" strokeWidth="2" />
    <circle cx="330" cy="40" r="17.099999999999998" fill="#9fc0ff" opacity=".18" className="footer-ai__pulse" style={{ animationDelay: "1.5s" }} /><circle cx="330" cy="40" r="9" fill={`url(#${id}n)`} stroke="#2B59FF" strokeWidth="2" />
    <circle cx="400" cy="385" r="17.099999999999998" fill="#9fc0ff" opacity=".18" className="footer-ai__pulse" style={{ animationDelay: "1.8s" }} /><circle cx="400" cy="385" r="9" fill={`url(#${id}n)`} stroke="#2B59FF" strokeWidth="2" />
    <circle cx="110" cy="210" r="17.099999999999998" fill="#9fc0ff" opacity=".18" className="footer-ai__pulse" style={{ animationDelay: "2.1s" }} /><circle cx="110" cy="210" r="9" fill={`url(#${id}n)`} stroke="#2B59FF" strokeWidth="2" />
    <circle cx="450" cy="130" r="15.2" fill="#9fc0ff" opacity=".18" className="footer-ai__pulse" style={{ animationDelay: "2.4s" }} /><circle cx="450" cy="130" r="8" fill={`url(#${id}n)`} stroke="#2B59FF" strokeWidth="2" />
    <circle cx="300" cy="250" r="15.2" fill="#9fc0ff" opacity=".18" className="footer-ai__pulse" style={{ animationDelay: "2.7s" }} /><circle cx="300" cy="250" r="8" fill={`url(#${id}n)`} stroke="#2B59FF" strokeWidth="2" />
    <circle cx="470" cy="280" r="15.2" fill="#9fc0ff" opacity=".18" className="footer-ai__pulse" style={{ animationDelay: "3.0s" }} /><circle cx="470" cy="280" r="8" fill={`url(#${id}n)`} stroke="#2B59FF" strokeWidth="2" />
  </svg>;
}
