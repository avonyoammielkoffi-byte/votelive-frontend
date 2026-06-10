import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCandidatesWithResults, getEventById } from '../services/api';

export default function ResultsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getEventById(eventId),
      getCandidatesWithResults(eventId),
    ]).then(([eventRes, candidatesRes]) => {
      setEvent(eventRes.data);
      setCandidates(candidatesRes.data);
      setLoading(false);
    }).catch(() => {
      setError('Les résultats ne sont pas encore publiés.');
      setLoading(false);
    });
  }, [eventId]);

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  const totalVotes = candidates.reduce((sum, c) => sum + (c.vote_count || 0), 0);

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logo}>Vote<span style={styles.logoSpan}>Live</span></div>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Retour</button>
      </nav>

      <div style={styles.wrap}>
        <div style={styles.header}>
          <h1 style={styles.title}>Résultats — {event?.name}</h1>
          <p style={styles.subtitle}>{totalVotes} votes au total</p>
        </div>

        {error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : (
          <div style={styles.list}>
            {candidates.map((c, i) => {
              const pct = totalVotes > 0 ? Math.round((c.vote_count / totalVotes) * 100) : 0;
              return (
                <div key={c.id} style={styles.resultCard}>
                  <div style={styles.rank}>#{i + 1}</div>
                  <div style={styles.candidatePhoto}>
                    {c.photo_url ? <img src={c.photo_url} alt={c.name} style={styles.photo} /> : <div style={styles.photoPlaceholder}>{c.name[0]}</div>}
                  </div>
                  <div style={styles.candidateInfo}>
                    <div style={styles.candidateName}>{c.name}</div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${pct}%` }} />
                    </div>
                    <div style={styles.voteInfo}>{c.vote_count || 0} votes · {pct}%</div>
                  </div>
                  {i === 0 && <div style={styles.winner}>🏆</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: 'sans-serif', background: '#f9f9f9', minHeight: '100vh' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#fff', borderBottom: '1px solid #eee' },
  logo: { fontSize: 20, fontWeight: 700 },
  logoSpan: { color: '#D85A30' },
  backBtn: { background: 'none', border: '1px solid #ddd', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13 },
  wrap: { maxWidth: 600, margin: '0 auto', padding: 24 },
  header: { textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888' },
  errorBox: { background: '#fff0f0', color: '#c00', padding: 20, borderRadius: 10, textAlign: 'center' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  resultCard: { background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 14 },
  rank: { fontSize: 18, fontWeight: 700, color: '#D85A30', minWidth: 30 },
  candidatePhoto: { width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 },
  photo: { width: '100%', height: '100%', objectFit: 'cover' },
  photoPlaceholder: { width: '100%', height: '100%', background: '#D85A30', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 },
  candidateInfo: { flex: 1 },
  candidateName: { fontSize: 15, fontWeight: 600, marginBottom: 6 },
  progressBar: { background: '#f0f0f0', borderRadius: 20, height: 8, marginBottom: 4, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#D85A30', borderRadius: 20 },
  voteInfo: { fontSize: 12, color: '#888' },
  winner: { fontSize: 24 },
};