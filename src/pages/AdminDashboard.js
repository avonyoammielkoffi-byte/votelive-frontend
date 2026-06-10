import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getActiveEvents, createEvent, deleteEvent, publishResults,
  createCandidate, deleteCandidate, getCandidatesByEvent, updateEvent
} from '../services/api';
import { uploadPhoto } from '../services/supabase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [eventForm, setEventForm] = useState({ name: '', description: '', price_gnf: '', start_date: '', end_date: '', logo_url: '', whatsapp: '', organizer: '' });
  const [candidateForm, setCandidateForm] = useState({ name: '', photo_url: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLogoFile, setEditLogoFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/admin');
    loadEvents();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const interval = setInterval(() => {
      loadCandidates(selectedEvent.id);
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedEvent]);

  const loadEvents = async () => {
    const res = await getActiveEvents();
    setEvents(res.data);
    setLoading(false);
  };

  const loadCandidates = async (eventId) => {
    const res = await getCandidatesByEvent(eventId);
    setCandidates(res.data);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    loadCandidates(event.id);
  };

  const handleCreateEvent = async () => {
    if (!eventForm.name || !eventForm.price_gnf) return alert('Nom et prix requis');
    setUploading(true);
    try {
      let logo_url = eventForm.logo_url;
      if (logoFile) logo_url = await uploadPhoto(logoFile);
      await createEvent({ ...eventForm, logo_url });
      setEventForm({ name: '', description: '', price_gnf: '', start_date: '', end_date: '', logo_url: '', whatsapp: '', organizer: '' });
      setLogoFile(null);
      setShowEventForm(false);
      loadEvents();
    } catch (e) {
      alert('Erreur: ' + (e?.message || JSON.stringify(e)));
    }
    setUploading(false);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Supprimer cet événement ?')) return;
    await deleteEvent(id);
    if (selectedEvent?.id === id) setSelectedEvent(null);
    loadEvents();
  };

  const handlePublish = async (id) => {
    if (!window.confirm('Publier les résultats et clôturer cet événement ?')) return;
    await publishResults(id);
    loadEvents();
  };

  const handleEditEvent = (ev, event) => {
    ev.stopPropagation();
    setEditingEvent(event.id);
    setEditForm({
      name: event.name || '',
      description: event.description || '',
      price_gnf: event.price_gnf || '',
      start_date: event.start_date ? event.start_date.split('T')[0] : '',
      end_date: event.end_date ? event.end_date.split('T')[0] : '',
      whatsapp: event.whatsapp || '',
      organizer: event.organizer || '',
      logo_url: event.logo_url || '',
    });
  };

  const handleSaveEdit = async (id) => {
    setUploading(true);
    try {
      let logo_url = editForm.logo_url;
      if (editLogoFile) logo_url = await uploadPhoto(editLogoFile);
      await updateEvent(id, { ...editForm, logo_url });
      setEditingEvent(null);
      setEditLogoFile(null);
      loadEvents();
    } catch (e) {
      alert('Erreur: ' + e.message);
    }
    setUploading(false);
  };

  const handleCreateCandidate = async () => {
    if (!candidateForm.name) return alert('Nom requis');
    setUploading(true);
    try {
      let photo_url = candidateForm.photo_url;
      if (photoFile) photo_url = await uploadPhoto(photoFile);
      await createCandidate({ name: candidateForm.name, photo_url, event_id: selectedEvent.id });
      setCandidateForm({ name: '', photo_url: '' });
      setPhotoFile(null);
      setShowCandidateForm(false);
      loadCandidates(selectedEvent.id);
    } catch (e) {
      alert('Erreur: ' + (e?.message || JSON.stringify(e)));
    }
    setUploading(false);
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Supprimer ce candidat ?')) return;
    await deleteCandidate(id);
    loadCandidates(selectedEvent.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin');
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logo}>Vote<span style={styles.logoSpan}>Live</span> <span style={styles.adminBadge}>Admin</span></div>
        <div style={styles.navRight}>
          <button style={styles.siteBtn} onClick={() => navigate('/')}>Voir le site</button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Déconnexion</button>
        </div>
      </nav>

      <div style={styles.body}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>Événements</h2>
            <button style={styles.addBtn} onClick={() => setShowEventForm(!showEventForm)}>+ Nouveau</button>
          </div>

          {showEventForm && (
            <div style={styles.form}>
              <input style={styles.input} placeholder="Nom de l'événement *" value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} />
              <input style={styles.input} placeholder="Organisateur (ex: Club XYZ)" value={eventForm.organizer} onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })} />
              <input style={styles.input} placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
              <input style={styles.input} placeholder="Prix par vote (GNF) *" type="number" value={eventForm.price_gnf} onChange={(e) => setEventForm({ ...eventForm, price_gnf: e.target.value })} />
              <input style={styles.input} placeholder="WhatsApp (ex: 224622000000)" value={eventForm.whatsapp} onChange={(e) => setEventForm({ ...eventForm, whatsapp: e.target.value })} />
              <label style={styles.photoLabel}>🖼️ Logo de l'organisateur</label>
              <input type="file" accept="image/*" style={styles.fileInput} onChange={(e) => setLogoFile(e.target.files[0])} />
              {logoFile && <img src={URL.createObjectURL(logoFile)} alt="logo preview" style={styles.preview} />}
              <input style={styles.input} placeholder="Date début" type="date" value={eventForm.start_date} onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })} />
              <input style={styles.input} placeholder="Date fin" type="date" value={eventForm.end_date} onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })} />
              <button style={styles.saveBtn} onClick={handleCreateEvent} disabled={uploading}>
                {uploading ? '⏳ En cours...' : "Créer l'événement"}
              </button>
            </div>
          )}

          {events.length === 0 ? (
            <div style={styles.empty}>Aucun événement</div>
          ) : (
            events.map((e) => (
              <div key={e.id}>
                <div
                  style={{ ...styles.eventItem, ...(selectedEvent?.id === e.id ? styles.eventItemActive : {}) }}
                  onClick={() => handleSelectEvent(e)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {e.logo_url && <img src={e.logo_url} alt="logo" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />}
                    <div>
                      <div style={styles.eventName}>{e.name}</div>
                      <div style={styles.eventMeta}>{e.price_gnf?.toLocaleString()} GNF · {e.is_active ? '🟢 Actif' : '⚫ Terminé'}</div>
                    </div>
                  </div>
                  <div style={styles.eventActions}>
                    <button style={styles.editBtn} onClick={(ev) => handleEditEvent(ev, e)} title="Modifier">✏️</button>
                    <button style={styles.publishBtn} onClick={(ev) => { ev.stopPropagation(); handlePublish(e.id); }} title="Publier résultats">📢</button>
                    <button style={styles.deleteBtn} onClick={(ev) => { ev.stopPropagation(); handleDeleteEvent(e.id); }} title="Supprimer">🗑️</button>
                  </div>
                </div>

                {editingEvent === e.id && (
                  <div style={styles.form}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#D85A30' }}>✏️ Modifier l'événement</div>
                    <input style={styles.input} placeholder="Nom *" value={editForm.name} onChange={(ev) => setEditForm({ ...editForm, name: ev.target.value })} />
                    <input style={styles.input} placeholder="Organisateur" value={editForm.organizer} onChange={(ev) => setEditForm({ ...editForm, organizer: ev.target.value })} />
                    <input style={styles.input} placeholder="Description" value={editForm.description} onChange={(ev) => setEditForm({ ...editForm, description: ev.target.value })} />
                    <input style={styles.input} placeholder="Prix (GNF) *" type="number" value={editForm.price_gnf} onChange={(ev) => setEditForm({ ...editForm, price_gnf: ev.target.value })} />
                    <input style={styles.input} placeholder="WhatsApp" value={editForm.whatsapp} onChange={(ev) => setEditForm({ ...editForm, whatsapp: ev.target.value })} />
                    <label style={styles.photoLabel}>🖼️ Nouveau logo</label>
                    <input type="file" accept="image/*" style={styles.fileInput} onChange={(ev) => setEditLogoFile(ev.target.files[0])} />
                    {editLogoFile && <img src={URL.createObjectURL(editLogoFile)} alt="preview" style={styles.preview} />}
                    {editForm.logo_url && !editLogoFile && <img src={editForm.logo_url} alt="logo actuel" style={styles.preview} />}
                    <input style={styles.input} placeholder="Date début" type="date" value={editForm.start_date} onChange={(ev) => setEditForm({ ...editForm, start_date: ev.target.value })} />
                    <input style={styles.input} placeholder="Date fin" type="date" value={editForm.end_date} onChange={(ev) => setEditForm({ ...editForm, end_date: ev.target.value })} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={styles.saveBtn} onClick={() => handleSaveEdit(e.id)} disabled={uploading}>
                        {uploading ? '⏳...' : '✅ Sauvegarder'}
                      </button>
                      <button style={{ ...styles.saveBtn, background: '#888' }} onClick={() => setEditingEvent(null)}>Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div style={styles.main}>
          {selectedEvent ? (
            <>
              <div style={styles.mainHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {selectedEvent.logo_url && <img src={selectedEvent.logo_url} alt="logo" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
                  <div>
                    <h2 style={styles.mainTitle}>Candidats — {selectedEvent.name}</h2>
                    {selectedEvent.organizer && <div style={{ fontSize: 12, color: '#888' }}>Organisateur : {selectedEvent.organizer}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={styles.refreshBtn} onClick={() => loadCandidates(selectedEvent.id)}>🔄 Rafraîchir</button>
                  <button style={styles.addBtn} onClick={() => setShowCandidateForm(!showCandidateForm)}>+ Ajouter</button>
                </div>
              </div>

              {showCandidateForm && (
                <div style={styles.form}>
                  <input style={styles.input} placeholder="Nom du candidat *" value={candidateForm.name} onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })} />
                  <label style={styles.photoLabel}>📷 Photo du candidat</label>
                  <input type="file" accept="image/*" style={styles.fileInput} onChange={(e) => setPhotoFile(e.target.files[0])} />
                  {photoFile && <img src={URL.createObjectURL(photoFile)} alt="preview" style={styles.preview} />}
                  <button style={styles.saveBtn} onClick={handleCreateCandidate} disabled={uploading}>
                    {uploading ? '⏳ Upload en cours...' : 'Ajouter le candidat'}
                  </button>
                </div>
              )}

              {candidates.length === 0 ? (
                <div style={styles.empty}>Aucun candidat pour cet événement</div>
              ) : (
                <div style={styles.candidatesGrid}>
                  {candidates.map((c) => (
                    <div key={c.id} style={styles.candidateCard}>
                      <div style={styles.candidatePhoto}>
                        {c.photo_url ? <img src={c.photo_url} alt={c.name} style={styles.photo} /> : <div style={styles.photoPlaceholder}>{c.name[0]}</div>}
                      </div>
                      <div style={styles.candidateName}>{c.name}</div>
                      <div style={styles.voteCount}>🗳️ {c.vote_count || 0} votes</div>
                      <button style={styles.deleteCandBtn} onClick={() => handleDeleteCandidate(c.id)}>Supprimer</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={styles.selectEventMsg}>👈 Sélectionnez un événement pour gérer ses candidats</div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: 'sans-serif', minHeight: '100vh', background: '#f5f5f5' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#fff', borderBottom: '1px solid #eee' },
  logo: { fontSize: 18, fontWeight: 700 },
  logoSpan: { color: '#D85A30' },
  adminBadge: { background: '#FAECE7', color: '#993C1D', fontSize: 11, borderRadius: 20, padding: '2px 8px', marginLeft: 8 },
  navRight: { display: 'flex', gap: 10 },
  siteBtn: { background: 'none', border: '1px solid #ddd', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13 },
  logoutBtn: { background: '#fff0f0', border: '1px solid #fcc', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#c00' },
  body: { display: 'flex', height: 'calc(100vh - 53px)' },
  sidebar: { width: 300, background: '#fff', borderRight: '1px solid #eee', overflowY: 'auto', padding: 16 },
  sidebarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sidebarTitle: { fontSize: 16, fontWeight: 700, margin: 0 },
  addBtn: { background: '#D85A30', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  refreshBtn: { background: '#f0f0f0', border: '1px solid #ddd', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 },
  form: { background: '#f9f9f9', borderRadius: 10, padding: 14, marginBottom: 16 },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, marginBottom: 8, boxSizing: 'border-box' },
  photoLabel: { fontSize: 12, color: '#888', display: 'block', marginBottom: 6 },
  fileInput: { width: '100%', marginBottom: 8 },
  preview: { width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 },
  saveBtn: { width: '100%', background: '#D85A30', color: '#fff', border: 'none', borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  eventItem: { padding: '12px', borderRadius: 10, marginBottom: 4, cursor: 'pointer', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  eventItemActive: { border: '1.5px solid #D85A30', background: '#FAECE7' },
  eventName: { fontSize: 14, fontWeight: 600, marginBottom: 3 },
  eventMeta: { fontSize: 12, color: '#888' },
  eventActions: { display: 'flex', gap: 6 },
  editBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 },
  publishBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 },
  empty: { textAlign: 'center', color: '#aaa', fontSize: 13, padding: 20 },
  main: { flex: 1, padding: 24, overflowY: 'auto' },
  mainHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  mainTitle: { fontSize: 18, fontWeight: 700, margin: 0 },
  candidatesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 },
  candidateCard: { background: '#fff', borderRadius: 12, border: '1px solid #eee', overflow: 'hidden', textAlign: 'center' },
  candidatePhoto: { height: 120, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: '100%', objectFit: 'cover' },
  photoPlaceholder: { width: 60, height: 60, borderRadius: '50%', background: '#D85A30', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 },
  candidateName: { fontSize: 14, fontWeight: 600, padding: '8px 8px 2px' },
  voteCount: { fontSize: 12, color: '#888', marginBottom: 8 },
  deleteCandBtn: { width: '100%', background: '#fff0f0', color: '#c00', border: 'none', padding: '8px', fontSize: 12, cursor: 'pointer' },
  selectEventMsg: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#aaa', fontSize: 16 },
};