import React from 'react';

export default function App() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Code Search Platform</h1>
      <p>Professional code intelligence and GitHub-style search.</p>

      <section style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem' }}>
          <strong>Query</strong>
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f3f4f6', borderRadius: '8px' }}>
            repo:github/docs language:markdown "code search"
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Card title="Search" value="Advanced query engine" />
          <Card title="Symbols" value="Definition-aware matching" />
          <Card title="Repos" value="Multi-repo context" />
          <Card title="Analytics" value="Search insights and trends" />
        </div>
      </section>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem' }}>
      <div style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>{value}</div>
    </div>
  );
}
