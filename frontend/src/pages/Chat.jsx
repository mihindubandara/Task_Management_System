import { useEffect, useState, useRef } from 'react';
import { getUsers, getChatHistory, sendChatMessage } from '../services/api';

function Chat() {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [error, setError] = useState('');

    const messagesEndRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    // Load eligible contacts
    useEffect(() => {
        const loadContacts = async () => {
            try {
                setLoadingContacts(true);
                setError('');
                const allUsers = await getUsers();

                // Filter contacts based on role rules:
                // Developer <-> Admin or Project Manager
                // Project Manager <-> Admin or Developer
                // Admin <-> Project Manager or Developer
                const eligible = allUsers.filter((user) => {
                    if (user._id === currentUser.id) return false;

                    if (currentUser.role === 'Developer') {
                        return user.role === 'Admin' || user.role === 'Project Manager';
                    }
                    if (currentUser.role === 'Project Manager') {
                        return user.role === 'Admin' || user.role === 'Developer';
                    }
                    if (currentUser.role === 'Admin') {
                        return user.role === 'Project Manager' || user.role === 'Developer';
                    }
                    return false;
                });

                setContacts(eligible);
            } catch (err) {
                console.error('Load Contacts Error:', err);
                setError('Failed to load chat contacts.');
            } finally {
                setLoadingContacts(false);
            }
        };

        if (currentUser.id) {
            loadContacts();
        }
    }, []);

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Scroll to bottom when messages load or change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle Contact Selection & Setup Polling
    const handleSelectContact = (contact) => {
        setSelectedContact(contact);
        setMessages([]);
        loadChatHistory(contact._id);

        // Clear existing interval if any
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        // Setup 3-second polling
        pollingIntervalRef.current = setInterval(() => {
            pollChatHistory(contact._id);
        }, 3000);
    };

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const loadChatHistory = async (contactId) => {
        try {
            setLoadingMessages(true);
            const history = await getChatHistory(contactId);
            setMessages(history);
        } catch (err) {
            console.error('Load Chat History Error:', err);
        } finally {
            setLoadingMessages(false);
        }
    };

    const pollChatHistory = async (contactId) => {
        try {
            const history = await getChatHistory(contactId);
            // Only update state if message length or contents differ to avoid page jump
            setMessages((prevMessages) => {
                if (JSON.stringify(prevMessages) !== JSON.stringify(history)) {
                    return history;
                }
                return prevMessages;
            });
        } catch (err) {
            console.error('Polling Chat History Error:', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedContact) return;

        const textToSend = inputText;
        setInputText('');

        try {
            const tempMessage = {
                _id: 'temp-' + Date.now(),
                sender: currentUser.id,
                recipient: selectedContact._id,
                text: textToSend,
                createdAt: new Date().toISOString()
            };

            setMessages((prev) => [...prev, tempMessage]);

            await sendChatMessage(selectedContact._id, textToSend);
            
            // Reload history to get final DB message object
            pollChatHistory(selectedContact._id);
        } catch (err) {
            console.error('Send Message Error:', err);
            alert('Failed to send message: ' + err.message);
        }
    };

    const formatMessageTime = (isoString) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    return (
        <div className="chat-page-container" style={{ display: 'flex', height: 'calc(100vh - 160px)', gap: '24px' }}>
            {/* Contacts list panel */}
            <div className="chat-contacts-panel" style={{ width: '320px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Messages</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Chat with your project team</p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {loadingContacts && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '8px' }}>
                            <div style={{ width: '20px', height: '20px', border: '2px solid rgba(79,70,229,0.1)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Loading contacts...</p>
                        </div>
                    )}

                    {!loadingContacts && error && (
                        <div style={{ color: 'var(--danger)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>{error}</div>
                    )}

                    {!loadingContacts && contacts.length === 0 && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No eligible team members found to chat.</p>
                    )}

                    {!loadingContacts && contacts.map((contact) => {
                        const isSelected = selectedContact?._id === contact._id;
                        return (
                            <div
                                key={contact._id}
                                onClick={() => handleSelectContact(contact)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    background: isSelected ? 'var(--primary-light)' : 'transparent',
                                    border: isSelected ? '1px solid var(--primary-border)' : '1px solid transparent',
                                    transition: 'var(--transition)',
                                    marginBottom: '6px'
                                }}
                                className="chat-contact-item"
                            >
                                <div className="topbar-avatar" style={{ width: '38px', height: '38px', fontSize: '14px', flexShrink: 0 }}>
                                    {contact.name?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong style={{ fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.name}</strong>
                                    </div>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: contact.role === 'Admin' ? '#f59e0b' : contact.role === 'Project Manager' ? '#10b981' : 'var(--primary)'
                                    }}>
                                        {contact.role}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat message history panel */}
            <div className="chat-history-panel" style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                {selectedContact ? (
                    <>
                        {/* Selected Contact Header */}
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="topbar-avatar" style={{ width: '40px', height: '40px', fontSize: '15px' }}>
                                {selectedContact.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{selectedContact.name}</h3>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedContact.role}</span>
                            </div>
                        </div>

                        {/* Messages display area */}
                        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#fcfcfd' }}>
                            {loadingMessages && messages.length === 0 ? (
                                <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                    <div style={{ width: '28px', height: '28px', border: '3px solid rgba(79,70,229,0.1)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading conversation history...</p>
                                </div>
                            ) : (
                                <>
                                    {messages.length === 0 && (
                                        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', minHeight: '150px' }}>
                                            No messages yet. Send a greeting to start the conversation!
                                        </div>
                                    )}

                                    {messages.map((msg) => {
                                        const isOwn = msg.sender === currentUser.id;
                                        return (
                                            <div
                                                key={msg._id}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: isOwn ? 'flex-end' : 'flex-start',
                                                    width: '100%'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        maxWidth: '65%',
                                                        padding: '12px 16px',
                                                        borderRadius: isOwn ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                                        background: isOwn ? 'var(--primary)' : '#f1f5f9',
                                                        color: isOwn ? 'white' : 'var(--text-primary)',
                                                        fontSize: '14px',
                                                        lineHeight: '1.5',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
                                                    {msg.text}
                                                </div>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
                                                    {formatMessageTime(msg.createdAt)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input form */}
                        <form onSubmit={handleSendMessage} style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', background: 'var(--bg-card)' }}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border-color)',
                                    outline: 'none',
                                    fontSize: '14px'
                                }}
                            />
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ padding: '12px 24px', borderRadius: 'var(--radius-lg)' }}
                                disabled={!inputText.trim()}
                            >
                                Send
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '16px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px'
                        }}>
                            ✉
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Your Conversation Inbox</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '320px', margin: 0 }}>
                            Select a team member from the contacts panel on the left to start chatting in real-time.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;
