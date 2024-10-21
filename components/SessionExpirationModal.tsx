import React, { useState, useEffect } from "react";

interface SessionExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshToken: () => void;
}

const SessionExpirationModal: React.FC<SessionExpirationModalProps> = ({
  isOpen,
  onClose,
  onRefreshToken,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    // Only set the interval when the modal is open
    if (isOpen) {
      setSecondsLeft(60); // Reset the timer whenever the modal opens

      // Create a new interval
      const interval = setInterval(() => {
        setSecondsLeft((seconds) => {
          if (seconds <= 1) {
            clearInterval(interval); // Stop the interval if the countdown finishes
            onClose(); // Auto logout or redirect when time expires
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);

      // Clear interval on cleanup
      return () => clearInterval(interval);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="session-modal-overlay">
      <div className="session-modal-content">
        <h2>¡Tu sesión está por expirar!</h2>
        <p>Redireccionando en {secondsLeft} segundos.</p>
        <div className="button-container">
          <button
            onClick={() => onRefreshToken()}
            className="session-modal-button stay-connected"
          >
            Mantenerse en linea
          </button>
          <button onClick={onClose} className="session-modal-button logout">
            Salir
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpirationModal;
