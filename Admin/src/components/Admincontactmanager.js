// src/components/Admincontactmanager.js
import React, { useState, useEffect } from 'react';
import DataTable from './DataTable/DataTable';
import Swal from 'sweetalert2';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// Normalizes a multi-line message: trims leading/trailing whitespace on
// every line so stray spaces/tabs in the stored text don't push the first
// line (or any line) out of alignment with the rest when rendered.
const cleanMessage = (msg) => {
    if (!msg) return '';
    return msg.split('\n').map(line => line.trim()).join('\n');
};

const KM = {
    orange: '#F15A24',
    blue:   '#1A3A6B',
    teal:   '#00B4D8',
    text:   '#1A1A2E',
    muted:  '#6B7280',
    border: '#E5E7EB',
    btnBlue: '#E6F0FA',
    btnBlueText: '#1E60AA'
};

const AdminContacts = function ({ showToast }) {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [selectedContact, setSelectedContact] = useState(null);

    function fetchContacts() {
        setLoading(true);
        setError('');
        fetch(API_URL + '/contact/all', {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
            }
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(json => {
                if (json.success) setContacts(json.data);
                else setError('Failed to load contacts.');
                setLoading(false);
            })
            .catch((err) => {
                console.error('Fetch error:', err);
                setError('Network error. Is your backend running?');
                setLoading(false);
            });
    }

    useEffect(() => { 
        fetchContacts();

        // SSE: listen for new contact events so admin sees submissions instantly
        try {
            const es = new EventSource(API_URL + '/contact/stream');
            es.addEventListener('contact', (ev) => {
                try {
                    const payload = JSON.parse(ev.data);
                    setContacts((prev) => [payload, ...prev]);
                    
                    // Show SweetAlert for new enquiry
                    Swal.fire({
                        title: '📩 New Enquiry!',
                        text: `#${payload.id} from ${payload.name}`,
                        icon: 'info',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        background: '#fff',
                        color: '#1A1A2E',
                        iconColor: '#00B4D8'
                    });
                } catch (e) { /* ignore invalid payload */ }
            });
            es.addEventListener('error', (e) => {
                // silently ignore; connection may retry automatically
            });
            return () => es.close();
        } catch (e) { /* EventSource not supported or fails */ }
    }, []);

    function deleteContact(id, name) {
        // SweetAlert confirmation
        Swal.fire({
            title: 'Are you sure?',
            html: `You are about to delete enquiry #${id} from <strong>${name}</strong>.<br>This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                // Proceed with deletion
                fetch(API_URL + '/contact/' + id, {
                    method: 'DELETE',
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                })
                    .then(res => res.json())
                    .then(json => {
                        if (json.success) {
                            setContacts(prev => prev.filter(c => c.id !== id));
                            
                            // Success notification
                            Swal.fire({
                                title: 'Deleted!',
                                text: 'Contact request removed successfully.',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false,
                                toast: true,
                                position: 'top-end'
                            });
                            
                            if (selectedContact && selectedContact.id === id) {
                                setSelectedContact(null);
                            }
                        } else {
                            // Error notification
                            Swal.fire({
                                title: 'Delete Failed',
                                text: 'Could not delete this contact.',
                                icon: 'error',
                                confirmButtonColor: '#1A3A6B'
                            });
                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            title: 'Delete Failed',
                            text: 'Something went wrong. Try again.',
                            icon: 'error',
                            confirmButtonColor: '#1A3A6B'
                        });
                    });
            }
        });
    }

    // Function to view contact details with SweetAlert
    function viewContactDetails(row) {
        Swal.fire({
            title: `Enquiry Details — #${row.id}`,
            html: `
                <div style="display: flex; flex-direction: column; gap: 16px; text-align: left; font-size: 14px;">
                    <div style="padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; display: flex; flex-direction: column; gap: 4px;">
                        <strong style="color: #6B7280;">Customer:</strong>
                        <div style="font-weight: 600; color: #1A1A2E;">${row.name}</div>
                        <div style="font-size: 12px; color: #6B7280;">${row.email}</div>
                        <div style="font-size: 12px; color: #6B7280;">${row.phone || 'No phone number'}</div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <strong style="color: #6B7280;">Date Sent:</strong>
                        <span style="color: #1A1A2E;">${fmtDate(row.createdAt)}</span>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <strong style="color: #6B7280;">Subject:</strong>
                        <span style="color: #F15A24; font-weight: 500;">${row.subject}</span>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <strong style="color: #6B7280;">Message:</strong>
                        <div style="background-color: #F9FAFB; padding: 10px; border-radius: 6px; border: 1px solid #E5E7EB; max-height: 150px; overflow-y: auto; color: #374151; line-height: 1.5; word-wrap: break-word; white-space: pre-wrap; text-align: left;">${row.message ? cleanMessage(row.message) : '<span style="color: #6B7280;">No message written.</span>'}</div>
                    </div>
                </div>
            `,
            icon: 'info',
            confirmButtonColor: '#1A3A6B',
            confirmButtonText: 'Close',
            showCancelButton: true,
            cancelButtonColor: '#F15A24',
            cancelButtonText: 'Delete',
            reverseButtons: true,
            width: '550px'
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel) {
                // User clicked "Delete" button
                deleteContact(row.id, row.name);
            }
        });
    }

    return (
        <div>
            <div className="section-header">
                <div className="section-title">Contact Requests</div>
            </div>

            {loading ? (
                <p className="km-loading">Loading...</p>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>{error}</div>
            ) : contacts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: KM.muted }}>
                    No contact requests found.
                </div>
            ) : (
                <DataTable
                    key={contacts.length} 
                    columns={['#ID', 'Name', 'Email', 'Subject', 'Message', 'Phone', 'Date', 'Actions']}
                    initialRows={contacts}
                    renderRow={(row) => (
                        <tr key={row.id}>
                            <td style={{ fontWeight: 600, color: KM.muted }}>#{row.id}</td>
                            <td style={{ fontWeight: 600, color: KM.text }}>{row.name}</td>
                            <td style={{ color: KM.teal }}>{row.email}</td>
                            <td style={{ color: KM.orange, fontWeight: 500 }}>{row.subject}</td>
                            <td style={{ color: KM.muted, fontStyle: 'italic', fontSize: '12px' }}>
                                {row.message && row.message.length > 40
                                    ? row.message.substring(0, 40) + '...'
                                    : row.message}
                            </td>
                            <td>{row.phone}</td>
                            <td>{fmtDate(row.createdAt)}</td>
                            <td>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button
                                        className="action-btn btn-view"
                                        style={{
                                            backgroundColor: KM.btnBlue,
                                            color: KM.btnBlueText,
                                            border: 'none',
                                            padding: '6px 14px',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                        onClick={() => viewContactDetails(row)}
                                    >
                                        <span>▼</span> View
                                    </button>
                                    <button
                                        className="action-btn btn-del"
                                        onClick={() => deleteContact(row.id, row.name)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                />
            )}
        </div>
    );
};

export default AdminContacts;