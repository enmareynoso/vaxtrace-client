import React from 'react';

interface SessionExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshToken: () => void;
}

const SessionExpirationModal: React.FC<SessionExpirationModalProps> = ({ isOpen, onClose, onRefreshToken }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2>Your Session is About to Expire!</h2>
        <p>Redirecting in 7 seconds.</p>
        <button onClick={onRefreshToken} style={{ marginRight: '10px' }}>Stay Connected</button>
        <button onClick={onClose}>Logout</button>
      </div>
    </div>
  );
};

export default SessionExpirationModal;
