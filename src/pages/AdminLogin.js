import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) return setError('Email et mot de passe requis');
    setLoading(true);
    setError('');
    try {
      const res = await adminLogin({ email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/admin/dashboard');
    } catch (e) {
      setError('Identifiants incorrects');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>Vote<span style={styles.logoSpan}>Live</span></div>
        <h2 style={styles.title}>Espace Admin</h2>
        <p style={styles.subtitle}>Connectez-vous pour gérer vos événements</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.inputWrap}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="admin@votelive.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={styles.inputWrap}>
          <label style={styles.label}>Mot de passe</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button style={styles.btn} onClick={handleLogin} disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        <button style={styles.backBtn} onClick={() => navigate('/')}>
          ← Retour au site
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f9f9f9', fontFamily: 'sans-serif' },
  card: { background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 400, border: '1px solid #eee', textAlign: 'center' },
  logo: { fontSize: 24, fontWeight: 700, marginBottom: 16 },
  logoSpan: { color: '#D85A30' },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 24 },
  error: { background: '#fff0f0', color: '#c00', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
  inputWrap: { marginBottom: 16, textAlign: 'left' },
  label: { fontSize: 12, color: '#888', display: 'block', marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  btn: { width: '100%', background: '#D85A30', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12 },
  backBtn: { background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer' },
};