import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, getCandidatesByEvent, registerVote } from '../services/api';

// Thème NUIT (original)
const darkTheme = {
  bg: '#0A0A0A',
  bgCard: '#141414',
  bgCardHover: '#1C1C1C',
  accent: '#D85A30',
  accentLight: '#F07040',
  accentGlow: 'rgba(216,90,48,0.15)',
  text: '#F5F0EB',
  textMuted: 'rgba(245,240,235,0.5)',
  textFaint: 'rgba(245,240,235,0.25)',
  border: 'rgba(245,240,235,0.08)',
  borderAccent: 'rgba(216,90,48,0.3)',
};

// Thème JOUR (clair, doux)
const lightTheme = {
  bg: '#F5F0EB',
  bgCard: '#FFFFFF',
  bgCardHover: '#FEFAF5',
  accent: '#D85A30',
  accentLight: '#F07040',
  accentGlow: 'rgba(216,90,48,0.08)',
  text: '#2D2A28',
  textMuted: '#8A8580',
  textFaint: '#C4BFBA',
  border: 'rgba(0,0,0,0.06)',
  borderAccent: 'rgba(216,90,48,0.2)',
};

const font = "'DM Sans', 'Segoe UI', sans-serif";
const fontDisplay = "'Playfair Display', Georgia, serif";

const paymentMethods = [
  { id: 'orange_money', label: 'Orange Money', icon: '📱' },
  { id: 'wave', label: 'Wave', icon: '🌊' },
  { id: 'mtn_money', label: 'MTN Money', icon: '🏦' },
  { id: 'carte', label: 'Carte bancaire', icon: '💳' },
];

export default function CandidatePage() {
  const { eventId, candidateId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('orange_money');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
    } else if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  // Sauvegarder le thème quand il change
  const toggleTheme = (isDark) => {
    setIsDarkMode(isDark);
    localStorage.setItem('themeMode', isDark ? 'dark' : 'light');
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap';
    document.head.appendChild(link);

    Promise.all([getEventById(eventId), getCandidatesByEvent(eventId)]).then(([eventRes, candidatesRes]) => {
      setEvent(eventRes.data);
      const found = candidatesRes.data.find((c) => c.id === candidateId);
      setCandidate(found);
      setLoading(false);
    });
  }, [eventId, candidateId]);

  const handleVote = async () => {
    if (!phone) return setError('Veuillez entrer votre numéro de téléphone');
    setSubmitting(true);
    setError('');
    try {
      await registerVote({ candidate_id: candidateId, event_id: eventId, payment_method: paymentMethod, phone, quantity });
      setSuccess(true);
    } catch (e) {
      setError('Erreur lors du vote. Veuillez réessayer.');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: theme.bg, fontFamily: font }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: `2px solid ${theme.border}`, borderTop: `2px solid ${theme.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!candidate) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: theme.bg, fontFamily: font }}>
      <p style={{ color: theme.textMuted, marginBottom: 20 }}>Candidat introuvable</p>
      <button onClick={() => navigate('/')} style={{ background: theme.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontFamily: font }}>Retour</button>
    </div>
  );

  const total = (event?.price_gnf || 0) * quantity;

  if (success) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: theme.bg, fontFamily: font, padding: 20 }}>
      <style>{`
        @keyframes popIn { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
      `}</style>
      <div style={{
        background: theme.bgCard, border: `1px solid ${theme.border}`,
        borderRadius: 20, padding: '48px 32px', textAlign: 'center',
        maxWidth: 360, width: '100%', animation: 'popIn 0.4s ease'
      }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: 700, color: theme.text, marginBottom: 10 }}>
          Vote enregistré !
        </h2>
        <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 8 }}>
          Merci d'avoir voté pour
        </p>
        <p style={{ fontFamily: fontDisplay, fontSize: 20, color: theme.accent, fontWeight: 700, marginBottom: 8 }}>
          {candidate.name}
        </p>
        <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 32 }}>
          {quantity} vote{quantity > 1 ? 's' : ''} · {total.toLocaleString()} GNF
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%', background: theme.accent, color: '#fff',
            border: 'none', borderRadius: 12, padding: '14px',
            fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: font
          }}
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: font, background: theme.bg, minHeight: '100vh', color: theme.text, transition: 'background 0.3s ease' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* NAV avec toggle Jour/Nuit */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px', position: 'sticky', top: 0, zIndex: 100,
        background: isDarkMode ? 'rgba(10,10,10,0.85)' : 'rgba(245,240,235,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.border}`
      }}>
        <div 
          onClick={() => navigate('/')}
          style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', cursor: 'pointer' }}
        >
          Vote<span style={{ color: theme.accent }}>Live</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Toggle Jour/Nuit */}
          <div style={{
            display: 'flex',
            background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            borderRadius: 40,
            padding: '4px',
            gap: '4px'
          }}>
            <button
              onClick={() => toggleTheme(false)}
              style={{
                background: !isDarkMode ? theme.accent : 'transparent',
                border: 'none',
                borderRadius: 32,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 16,
                transition: 'all 0.2s',
                opacity: !isDarkMode ? 1 : 0.6,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>☀️</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: !isDarkMode ? '#fff' : theme.textMuted }}>Jour</span>
            </button>
            <button
              onClick={() => toggleTheme(true)}
              style={{
                background: isDarkMode ? theme.accent : 'transparent',
                border: 'none',
                borderRadius: 32,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 16,
                transition: 'all 0.2s',
                opacity: isDarkMode ? 1 : 0.6,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>🌙</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: isDarkMode ? '#fff' : theme.textMuted }}>Nuit</span>
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent', border: `1px solid ${theme.border}`,
              borderRadius: 8, padding: '7px 16px', color: theme.textMuted,
              fontSize: 13, cursor: 'pointer', fontFamily: font, transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.target.style.color = theme.text; e.target.style.borderColor = theme.accent; }}
            onMouseLeave={e => { e.target.style.color = theme.textMuted; e.target.style.borderColor = theme.border; }}
          >
            ← Retour
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 48px', animation: 'fadeUp 0.5s ease' }}>

        {/* PHOTO HERO */}
        <div style={{
          borderRadius: 20, overflow: 'hidden', marginBottom: 20,
          border: `1px solid ${theme.border}`, position: 'relative'
        }}>
          <div style={{ height: 280, background: isDarkMode ? '#1A1A1A' : '#E8E4E0', position: 'relative' }}>
            {candidate.photo_url ? (
              <img src={candidate.photo_url} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDarkMode ? 'linear-gradient(135deg, #1A1A1A, #2A1A10)' : 'linear-gradient(135deg, #E8E4E0, #DDD6CF)',
                fontSize: 64, fontWeight: 700, color: theme.accent, fontFamily: fontDisplay
              }}>
                {candidate.name[0]}
              </div>
            )}
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(to top, ${isDarkMode ? 'rgba(10,10,10,0.9)' : 'rgba(0,0,0,0.2)'} 0%, transparent 50%)`
            }} />
            <div style={{
              position: 'absolute', top: 14, left: 14,
              background: isDarkMode ? 'rgba(10,10,10,0.7)' : 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.border}`,
              color: theme.textMuted, fontSize: 11, borderRadius: 20, padding: '5px 12px',
              letterSpacing: '0.04em'
            }}>
              {event?.name}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 20px 18px' }}>
              <h1 style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                {candidate.name}
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Candidat · {event?.name}</p>
            </div>
          </div>
        </div>

        {/* VOTE CARD */}
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20, overflow: 'hidden' }}>

          {/* Prix & Quantité */}
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: theme.textMuted }}>Prix par vote</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: theme.text, fontFamily: fontDisplay }}>
                {event?.price_gnf?.toLocaleString()} GNF
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: theme.textMuted }}>Nombre de votes</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', border: `1px solid ${theme.border}`,
                    background: 'transparent', color: theme.text, cursor: 'pointer',
                    fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', fontFamily: font
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = theme.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}
                >−</button>
                <span style={{ fontSize: 18, fontWeight: 700, minWidth: 24, textAlign: 'center', color: theme.text }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', border: `1px solid ${theme.border}`,
                    background: 'transparent', color: theme.text, cursor: 'pointer',
                    fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', fontFamily: font
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = theme.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}
                >+</button>
              </div>
            </div>

            {/* Total */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px', background: theme.accentGlow, borderRadius: 12,
              border: `1px solid ${theme.borderAccent}`, marginBottom: 20
            }}>
              <span style={{ fontSize: 13, color: theme.accentLight }}>Total à payer</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: theme.accent, fontFamily: fontDisplay }}>
                {total.toLocaleString()} GNF
              </span>
            </div>
          </div>

          {/* Séparateur */}
          <div style={{ height: 1, background: theme.border, margin: '0 20px' }} />

          {/* Moyen de paiement */}
          <div style={{ padding: '20px 20px 0' }}>
            <p style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontWeight: 600 }}>
              Moyen de paiement
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {paymentMethods.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPaymentMethod(p.id)}
                  style={{
                    border: paymentMethod === p.id ? `1.5px solid ${theme.accent}` : `1px solid ${theme.border}`,
                    background: paymentMethod === p.id ? theme.accentGlow : 'transparent',
                    borderRadius: 12, padding: '12px 10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: paymentMethod === p.id ? 600 : 400, color: paymentMethod === p.id ? theme.text : theme.textMuted }}>
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Téléphone */}
          <div style={{ padding: '0 20px 20px' }}>
            <p style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 600 }}>
              Numéro de téléphone
            </p>
            <input
              type="tel"
              placeholder="Ex : 622 00 00 00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%', padding: '13px 16px',
                background: isDarkMode ? 'rgba(245,240,235,0.05)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${theme.border}`,
                borderRadius: 12, color: theme.text, fontSize: 15, fontFamily: font,
                outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = theme.accent}
              onBlur={e => e.target.style.borderColor = theme.border}
            />
          </div>

          {/* Erreur */}
          {error && (
            <div style={{ margin: '0 20px 16px', background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.2)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#FF6B6B' }}>
              {error}
            </div>
          )}

          {/* Bouton vote */}
          <div style={{ padding: '0 20px 20px' }}>
            <button
              onClick={handleVote}
              disabled={submitting}
              style={{
                width: '100%', background: submitting ? 'rgba(216,90,48,0.5)' : theme.accent,
                color: '#fff', border: 'none', borderRadius: 14, padding: '16px',
                fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: font, transition: 'all 0.25s', letterSpacing: '0.02em',
                transform: submitting ? 'scale(0.98)' : 'scale(1)'
              }}
              onMouseEnter={e => { if (!submitting) e.target.style.background = '#b84a24'; }}
              onMouseLeave={e => { if (!submitting) e.target.style.background = theme.accent; }}
            >
              {submitting ? '⏳ Traitement en cours...' : `Confirmer mon vote — ${total.toLocaleString()} GNF`}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: theme.textFaint, marginTop: 12 }}>
              🔒 Paiement sécurisé
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}