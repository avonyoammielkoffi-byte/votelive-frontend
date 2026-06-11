import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveEvents, getCandidatesByEvent } from '../services/api';

const darkTheme = {
  bg: '#0A0A0A', bgCard: '#141414', bgCardHover: '#1C1C1C',
  accent: '#D85A30', accentLight: '#F07040', accentGlow: 'rgba(216,90,48,0.15)',
  gold: '#E8B84B', text: '#F5F0EB', textMuted: 'rgba(245,240,235,0.5)',
  textFaint: 'rgba(245,240,235,0.25)', border: 'rgba(245,240,235,0.08)',
  borderAccent: 'rgba(216,90,48,0.3)',
};

const lightTheme = {
  bg: '#F5F0EB', bgCard: '#FFFFFF', bgCardHover: '#FEFAF5',
  accent: '#D85A30', accentLight: '#F07040', accentGlow: 'rgba(216,90,48,0.08)',
  gold: '#E8B84B', text: '#2D2A28', textMuted: '#8A8580',
  textFaint: '#C4BFBA', border: 'rgba(0,0,0,0.06)',
  borderAccent: 'rgba(216,90,48,0.2)',
};

const font = "'DM Sans', 'Segoe UI', sans-serif";
const fontDisplay = "'Playfair Display', Georgia, serif";

export default function HomePage() {
  const [, setEvents] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme === 'light') setIsDarkMode(false);
    else if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  const toggleTheme = (isDark) => {
    setIsDarkMode(isDark);
    localStorage.setItem('themeMode', isDark ? 'dark' : 'light');
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap';
    document.head.appendChild(link);

    getActiveEvents().then((res) => {
      setEvents(res.data);
      if (res.data.length > 0) {
        setSelectedEvent(res.data[0]);
        getCandidatesByEvent(res.data[0].id).then((r) => {
          setCandidates(r.data);
          setLoading(false);
        });
      } else setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: theme.bg, fontFamily: font }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: `2px solid ${theme.border}`, borderTop: `2px solid ${theme.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: theme.textMuted, fontSize: 14 }}>Chargement...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';

  return (
    <div style={{ fontFamily: font, background: theme.bg, minHeight: '100vh', color: theme.text, transition: 'background 0.3s ease, color 0.3s ease' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(1.5); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${theme.bg}; }
        ::-webkit-scrollbar-thumb { background: ${theme.accent}; border-radius: 2px; }
      `}</style>

      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px', position: 'sticky', top: 0, zIndex: 100,
        background: isDarkMode ? 'rgba(10,10,10,0.85)' : 'rgba(245,240,235,0.92)',
        backdropFilter: 'blur(20px)', borderBottom: `1px solid ${theme.border}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Vote<span style={{ color: theme.accent }}>Live</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', borderRadius: 40, padding: '4px', gap: '4px' }}>
            <button onClick={() => toggleTheme(false)} style={{ background: !isDarkMode ? theme.accent : 'transparent', border: 'none', borderRadius: 32, padding: '6px 12px', cursor: 'pointer', fontSize: 16, transition: 'all 0.2s', opacity: !isDarkMode ? 1 : 0.6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>☀️</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: !isDarkMode ? '#fff' : theme.textMuted }}>Jour</span>
            </button>
            <button onClick={() => toggleTheme(true)} style={{ background: isDarkMode ? theme.accent : 'transparent', border: 'none', borderRadius: 32, padding: '6px 12px', cursor: 'pointer', fontSize: 16, transition: 'all 0.2s', opacity: isDarkMode ? 1 : 0.6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🌙</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: isDarkMode ? '#fff' : theme.textMuted }}>Nuit</span>
            </button>
          </div>
          <button onClick={() => navigate('/admin')} style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '7px 16px', color: theme.textMuted, fontSize: 13, cursor: 'pointer', fontFamily: font }}>
            Administration
          </button>
        </div>
      </nav>

      {selectedEvent ? (
        <>
          <div style={{ position: 'relative', padding: '48px 24px 40px', textAlign: 'center', overflow: 'hidden', animation: 'fadeUp 0.6s ease both' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${theme.accentGlow} 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: isDarkMode ? 'rgba(232,184,75,0.12)' : 'rgba(232,184,75,0.15)',
                border: `1px solid rgba(232,184,75,0.3)`,
                borderRadius: 20, padding: '5px 14px', fontSize: 12,
                color: theme.gold, marginBottom: 16, fontWeight: 600,
                letterSpacing: '0.05em', textTransform: 'uppercase'
              }}>
                🏆 Site officiel de vote
              </div>

              {selectedEvent.logo_url && (
                <div style={{ marginBottom: 20 }}>
                  <img src={selectedEvent.logo_url} alt="logo organisateur" style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover', border: `2px solid ${theme.borderAccent}`, boxShadow: `0 8px 24px rgba(0,0,0,0.3)` }} />
                </div>
              )}

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: isDarkMode ? 'rgba(216,90,48,0.12)' : 'rgba(216,90,48,0.1)',
                border: `1px solid ${theme.borderAccent}`,
                borderRadius: 20, padding: '6px 16px', fontSize: 12, color: theme.accentLight,
                marginBottom: 20, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent, animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
                En direct
              </div>

              <h1 style={{ fontFamily: fontDisplay, fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 700, margin: '0 0 8px', lineHeight: 1.15, color: theme.text }}>
                {selectedEvent.name}
              </h1>

              {selectedEvent.organizer && (
                <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 10 }}>
                  Organisé par <span style={{ color: theme.accent, fontWeight: 600 }}>{selectedEvent.organizer}</span>
                </div>
              )}

              {selectedEvent.description && (
                <p style={{ color: theme.textMuted, fontSize: 15, maxWidth: 480, margin: '0 auto 24px' }}>
                  {selectedEvent.description}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginBottom: 24 }}>
                {[
                  { val: candidates.length, label: 'Candidats' },
                  { val: `${selectedEvent.price_gnf?.toLocaleString()} GNF`, label: 'Par vote' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 600, color: theme.text, fontFamily: fontDisplay }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {selectedEvent.whatsapp && (
                
                  href={"https://wa.me/" + selectedEvent.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,211,102,0.3)' }}
                >
                  💬 Contacter sur WhatsApp
                </a>
              )}
            </div>
          </div>

          <div style={{ padding: '0 20px 8px', animation: 'fadeUp 0.6s 0.15s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 3, height: 20, background: theme.accent, borderRadius: 2 }} />
              <h2 style={{ fontSize: 16, fontWeight: 600, color: theme.text, margin: 0 }}>Les candidats</h2>
              <span style={{ marginLeft: 'auto', background: theme.accentGlow, color: theme.accent, border: `1px solid ${theme.borderAccent}`, borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>{candidates.length}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
              {candidates.map((c, idx) => (
                <div
                  key={c.id}
                  style={{
                    background: hoveredCard === c.id ? theme.bgCardHover : theme.bgCard,
                    border: hoveredCard === c.id ? `1px solid ${theme.borderAccent}` : `1px solid ${theme.border}`,
                    borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                    transition: 'all 0.25s', transform: hoveredCard === c.id ? 'translateY(-6px) scale(1.02)' : 'none',
                    animation: `fadeUp 0.5s ${0.1 * idx}s ease both`, opacity: 0, animationFillMode: 'forwards',
                    boxShadow: hoveredCard === c.id ? `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${theme.borderAccent}` : 'none'
                  }}
                  onMouseEnter={() => setHoveredCard(c.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div
                    style={{ height: 160, background: isDarkMode ? '#1A1A1A' : '#E8E4E0', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredImage(c.id)}
                    onMouseLeave={() => setHoveredImage(null)}
                    onClick={() => navigate(`/event/${selectedEvent.id}/candidate/${c.id}`)}
                  >
                    {c.photo_url ? (
                      <img src={c.photo_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', transition: 'transform 0.4s', transform: hoveredCard === c.id ? 'scale(1.08)' : 'scale(1)' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDarkMode ? `linear-gradient(135deg, #1A1A1A, #2A1A10)` : `linear-gradient(135deg, #E8E4E0, #DDD6CF)`, fontSize: 40, fontWeight: 700, color: theme.accent, fontFamily: fontDisplay }}>
                        {c.name[0]}
                      </div>
                    )}
                    {hoveredImage === c.id && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(216,90,48,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeUp 0.2s ease' }}>
                        <span style={{ color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Voter</span>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '12px 12px 0' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, textAlign: 'center', marginBottom: 4 }}>{c.name}</div>
                  </div>

                  <button
                    style={{ width: '100%', background: hoveredCard === c.id ? theme.accent : 'transparent', color: hoveredCard === c.id ? '#fff' : theme.accent, border: 'none', borderTop: `1px solid ${hoveredCard === c.id ? 'transparent' : theme.border}`, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: font, transition: 'all 0.25s', marginTop: 10, letterSpacing: '0.02em' }}
                    onClick={() => navigate(`/event/${selectedEvent.id}/candidate/${c.id}`)}
                  >
                    {hoveredCard === c.id ? `→ Voter maintenant` : `Candidat ${idx + 1}`}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '32px 20px 8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, animation: 'fadeUp 0.6s 0.2s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 3, height: 20, background: theme.accent, borderRadius: 2 }} />
                <h2 style={{ fontSize: 16, fontWeight: 600, color: theme.text, margin: 0 }}>Infos sur l'événement</h2>
              </div>
              <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 16, padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Date de début', val: formatDate(selectedEvent.start_date) },
                  { label: 'Date de clôture', val: formatDate(selectedEvent.end_date) },
                  { label: 'Prix par vote', val: `${selectedEvent.price_gnf?.toLocaleString()} GNF` },
                  { label: 'Candidats', val: candidates.length },
                  ...(selectedEvent.organizer ? [{ label: 'Organisateur', val: selectedEvent.organizer }] : []),
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 3, height: 20, background: theme.accent, borderRadius: 2 }} />
                <h2 style={{ fontSize: 16, fontWeight: 600, color: theme.text, margin: 0 }}>Comment voter ?</h2>
              </div>
              <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 16, padding: '20px' }}>
                {[
                  { n: '01', t: 'Choisissez votre candidat', d: 'Parcourez les candidats et cliquez sur celui que vous souhaitez soutenir.' },
                  { n: '02', t: 'Sélectionnez votre paiement', d: 'Orange Money, Wave, MTN Money ou carte bancaire.' },
                  { n: '03', t: 'Confirmez votre vote', d: 'Entrez votre numéro et validez. Vote enregistré instantanément.' },
                  { n: '04', t: 'Votez plusieurs fois', d: 'Boostez votre candidat en votant autant de fois que vous voulez.' },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < 3 ? `1px solid ${theme.border}` : 'none' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent, minWidth: 28, fontFamily: fontDisplay, letterSpacing: '0.05em' }}>{step.n}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 4 }}>{step.t}</div>
                      <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.5 }}>{step.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: '32px 20px 8px', animation: 'fadeUp 0.6s 0.3s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ width: 40, height: 3, background: theme.accent, margin: '0 auto 16px', borderRadius: 2 }} />
                <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.text, margin: 0 }}>Questions fréquentes</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { q: 'Peut-on voter plusieurs fois ?', a: 'Oui, chaque paiement compte comme un vote supplémentaire.' },
                  { q: 'Quand les résultats sont annoncés ?', a: "Les résultats seront publiés par l'organisateur après la clôture." },
                  { q: 'Mon paiement est-il sécurisé ?', a: 'Oui, tous les paiements sont traités via des plateformes officielles sécurisées.' },
                ].map((f, i) => (
                  <div key={i} style={{ background: theme.bgCard, borderRadius: 14, border: `1px solid ${theme.border}`, padding: '16px 20px' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 8, display: 'flex', gap: 10 }}>
                      <span style={{ color: theme.accent }}>—</span> {f.q}
                    </div>
                    <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.5, paddingLeft: 22 }}>{f.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedEvent.whatsapp && (
            <div style={{ textAlign: 'center', padding: '32px 20px' }}>
              <p style={{ fontSize: 14, color: theme.textMuted, marginBottom: 12 }}>Un problème ? Contactez l'organisateur</p>
              <a href={"https://wa.me/" + selectedEvent.whatsapp} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                💬 WhatsApp : +{selectedEvent.whatsapp}
              </a>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: theme.textMuted, fontSize: 15 }}>
          Aucun événement en cours pour le moment.
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '32px 20px', borderTop: `1px solid ${theme.border}`, marginTop: 32, fontSize: 12, color: theme.textFaint, letterSpacing: '0.04em' }}>
        VoteLive · Plateforme de vote en ligne · Guinée
      </footer>
    </div>
  );
}