"use client"
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import logo from "@/public/images/logo.png";
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/api/auth';
import './ResetPassword.css';
import { Eye, EyeOff } from 'lucide-react'; 
import { useToast } from "@/components/ui/use-toast";

const ResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Password do not match",
        duration: 5000,
      });
    }
    try {
      const resetRequest = {
        token: token as string,
        newPassword: newPassword,
      };
      await resetPassword(resetRequest);
      toast({
        title: "Success",
        description: "Password updated successfully",
        duration: 5000,
      })
    } catch (err: any) {
      setError(err.message || 'An error occurred during the password reset.');
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden z-0">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1140 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            opacity="0.3"
            d="M193.307 -273.321L1480.87 1014.24L1121.85 1373.26C1121.85 1373.26 731.745 983.231 478.513 729.927C225.976 477.317 -165.714 85.6993 -165.714 85.6993L193.307 -273.321Z"
            fill="url(#paint0_linear)"
          />
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="1908.65"
              y1="1642.58"
              x2="602.827"
              y2="-418.681"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#3056D3" stopOpacity="0.36" />
              <stop offset="1" stopColor="#3056D3" stopOpacity="0.3" />
              <stop offset="1" stopColor="#3056D3" stopOpacity="0.096144" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="reset-password-container relative z-10">
        <Image className="logo" src={logo} alt="Vaxtrace Logo" />
        <h2>Welcome to Vaxtrace!</h2>
        <p>To get started with your new account, please update your password.</p>
        <h4>Set password</h4>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <form>
          <div className="form-group">
            <label htmlFor="newPassword">New password:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button type="button" onClick={togglePasswordVisibility} className="password-toggle">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Verify password:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button type="button" onClick={togglePasswordVisibility} className="password-toggle">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" onClick={handleSubmit} className="submit-button">Set Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
