"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resetPassword } from '@/lib/api/auth';

const SetPasswordForm: React.FC = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const resetRequest = {
        token: token as string,
        newPassword: newPassword,
      };
      await resetPassword(resetRequest);
      setSuccess('Password updated successfully.');
      router.push('/auth/set_password_success'); // Redirect to success page
    } catch (err: any) {
      setError(err.message || 'An error occurred during the password reset.');
    }
  };

  return (
    <div>
      <h2>Set your new password</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type="submit">Set Password</button>
      </form>
    </div>
  );
};

export default SetPasswordForm;
