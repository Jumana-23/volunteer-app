import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Divider,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  styled,
} from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

const API = '/api';

const StyledContainer = styled(Box)(() => ({
  minHeight: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #3AB795 0%, #F76C5E 50%, #FFD972 100%)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '80px 20px 40px 20px',
}));

const StyledPaper = styled(Paper)(() => ({
  padding: '32px',
  borderRadius: '16px',
  background: '#ffffff',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  width: '100%',
  maxWidth: '1400px',
  border: '1px solid rgba(0, 0, 0, 0.05)',
}));

const SectionHeader = ({ title, onCSV, onPDF, disabled }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
    <Typography variant="h6" fontWeight={700} sx={{ color: '#2c3e50' }}>
      {title}
    </Typography>
    <Box>
      <Button onClick={onCSV} variant="outlined" sx={{ mr: 1 }} disabled={disabled}>CSV</Button>
      <Button onClick={onPDF} variant="outlined" disabled={disabled}>PDF</Button>
    </Box>
  </Box>
);

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);   // volunteer history rows
  const [events, setEvents] = useState([]);     // events with assignments
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [hRes, eRes] = await Promise.all([
          fetch(`${API}/volunteer-history?limit=1000`, { headers: authHeaders }),
          fetch(`${API}/events`, { headers: authHeaders }),
        ]);

        if (!hRes.ok) {
          const err = await hRes.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to fetch volunteer history');
        }
        if (!eRes.ok) {
          const err = await eRes.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to fetch events');
        }

        const [hJson, eJson] = await Promise.all([hRes.json(), eRes.json()]);
        if (!isMounted) return;
        setHistory(Array.isArray(hJson) ? hJson : []);
        setEvents(Array.isArray(eJson) ? eJson : []);
      } catch (err) {
        if (!isMounted) return;
        setSnack({ open: true, message: err.message || 'Load failed', severity: 'error' });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, [authHeaders]);

  const volunteerCSV = () => {
    const rows = history.map(h => ({
      Volunteer: h.volunteerName || h.volunteerId?.profile?.fullName || h.volunteerId?.email || 'Unknown',
      Event: h.eventName,
      Date: h.eventDate ? new Date(h.eventDate).toLocaleDateString() : '',
      Hours: h.hoursWorked ?? 0,
      Status: h.status || '',
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'volunteer_participation.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const volunteerPDF = () => {
    const doc = new jsPDF();
    doc.text('Volunteer Participation', 14, 15);
    const body = history.map(h => ([
      h.volunteerName || h.volunteerId?.profile?.fullName || h.volunteerId?.email || 'Unknown',
      h.eventName,
      h.eventDate ? new Date(h.eventDate).toLocaleDateString() : '',
      h.hoursWorked ?? 0,
      h.status || '',
    ]));
    autoTable(doc, {
      head: [['Volunteer', 'Event', 'Date', 'Hours', 'Status']],
      body,
      startY: 22,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [240, 240, 240] },
    });
    doc.save('volunteer_participation.pdf');
  };

  const eventCSV = () => {
    const rows = events.map(e => ({
      Event: e.title,
      Date: e.date ? new Date(e.date).toLocaleDateString() : '',
      Location: e.location || '',
      Required: e.requiredVolunteers ?? 0,
      Assigned: (e.assignedVolunteers || []).length,
      Volunteers: (e.assignedVolunteers || [])
        .map(v => v.volunteerName || v?.volunteerId?.profile?.fullName || v?.volunteerId?.email)
        .filter(Boolean)
        .join(', '),
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'event_details.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const eventPDF = () => {
    const doc = new jsPDF();
    doc.text('Event Details & Assignments', 14, 15);
    const body = events.map(e => ([
      e.title,
      e.date ? new Date(e.date).toLocaleDateString() : '',
      e.location || '',
      `${(e.assignedVolunteers || []).length}/${e.requiredVolunteers ?? 0}`,
      (e.assignedVolunteers || [])
        .map(v => v.volunteerName || v?.volunteerId?.profile?.fullName || v?.volunteerId?.email)
        .filter(Boolean)
        .join(', '),
    ]));
    autoTable(doc, {
      head: [['Event', 'Date', 'Location', 'Assigned/Required', 'Volunteers']],
      body,
      startY: 22,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
        4: { cellWidth: 90 }, // widen volunteers column a bit
      },
    });
    doc.save('event_details.pdf');
  };

  return (
    <StyledContainer>
      <StyledPaper>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#2c3e50', mb: 1 }}>
            Reports
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
            Export volunteer participation and event assignment details.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <SectionHeader
              title="Volunteer Participation"
              onCSV={volunteerCSV}
              onPDF={volunteerPDF}
              disabled={history.length === 0}
            />
            <TableContainer sx={{ mb: 4, border: '1px solid #eee', borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Volunteer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hours</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#7f8c8d' }}>
                        No participation records yet
                      </TableCell>
                    </TableRow>
                  ) : history.map((r) => (
                    <TableRow key={`${r.volunteerId?._id || r.volunteerName}-${r.eventId?._id || r.eventName}-${r.eventDate}`}>
                      <TableCell>{r.volunteerName || r.volunteerId?.profile?.fullName || r.volunteerId?.email || 'Unknown'}</TableCell>
                      <TableCell>{r.eventName}</TableCell>
                      <TableCell>{r.eventDate ? new Date(r.eventDate).toLocaleDateString() : ''}</TableCell>
                      <TableCell>{r.hoursWorked ?? 0}</TableCell>
                      <TableCell>{r.status || ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 2 }} />

            <SectionHeader
              title="Event Details & Assignments"
              onCSV={eventCSV}
              onPDF={eventPDF}
              disabled={events.length === 0}
            />
            <TableContainer sx={{ border: '1px solid #eee', borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Assigned / Required</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Volunteers</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#7f8c8d' }}>
                        No events found
                      </TableCell>
                    </TableRow>
                  ) : events.map((e) => (
                    <TableRow key={e._id}>
                      <TableCell>{e.title}</TableCell>
                      <TableCell>{e.date ? new Date(e.date).toLocaleDateString() : ''}</TableCell>
                      <TableCell>{e.location || ''}</TableCell>
                      <TableCell>{(e.assignedVolunteers || []).length}/{e.requiredVolunteers ?? 0}</TableCell>
                      <TableCell>
                        {(e.assignedVolunteers || [])
                          .map(v => v.volunteerName || v?.volunteerId?.profile?.fullName || v?.volunteerId?.email)
                          .filter(Boolean)
                          .join(', ')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        <Snackbar
          open={snack.open}
          autoHideDuration={5000}
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
            {snack.message}
          </Alert>
        </Snackbar>
      </StyledPaper>
    </StyledContainer>
  );
}
