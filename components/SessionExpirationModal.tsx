import React, { useState, useEffect } from 'react';

interface SessionExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshToken: () => void;
}

const SessionExpirationModal: React.FC<SessionExpirationModalProps> = ({ isOpen, onClose, onRefreshToken }) => {
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isOpen && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(secondsLeft - 1);
      }, 1000);
    } else if (secondsLeft <= 0) {
      onClose(); // auto logout or redirect when time expires
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, secondsLeft, onClose]);

  if (!isOpen) return null;

  return (
    <div className="session-modal-overlay">
      <div className="session-modal-content">
        <h2>Your Session is About to Expire!</h2>
        <p>Redirecting in {secondsLeft} seconds.</p>
        <button onClick={onRefreshToken} className="session-modal-button stay-connected">Stay Connected</button>
        <button onClick={onClose} className="session-modal-button logout">Logout</button>
      </div>
    </div>
  );
};

export default SessionExpirationModal;
