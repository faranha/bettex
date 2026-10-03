import type { ReactNode } from 'react';

export function BusinessPlanTable({ caption, headers, rows }: { caption: string; headers: string[]; rows: ReactNode[][] }) {
  return <div className="whitepaper__vesting-scroll whitepaper__business-scroll" role="region" aria-label={caption} tabIndex={0}>
    <table className="whitepaper__vesting-table whitepaper__business-table">
      <caption>{caption}</caption>
      <thead><tr>{headers.map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, col) => col === 0
        ? <th key={col} scope="row">{cell}</th> : <td key={col}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}