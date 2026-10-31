export function AgentValue({ value, color }: { value: string; color: string }) {
  const width = Math.max(32, value.length * 5 + 10);
  return (
    <g data-testid="agent-value" aria-label={`Valor ilustrativo: ${value}`}>
      <title>{`Valor ilustrativo: ${value}`}</title>
      <line x1="0" y1="-58" x2="0" y2="-54" stroke={color} strokeOpacity=".6" strokeWidth="1" />
      <rect x={-width / 2} y="-72" width={width} height="14" rx="4" fill="#070B1F" stroke={color} strokeWidth="1" />
      <text x="0" y="-62" textAnchor="middle" fill={color} fontFamily="var(--app-font-mono)" fontSize="8" fontWeight="700">{value}</text>
    </g>
  );
}