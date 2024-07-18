import React, { useState } from 'react';
import Image from 'next/image';
import logo from '../../images/logo.png';
import MainImage from '../../images/heroImage.png';
import { Button } from "@/components/ui/button"

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Email:', email);
        // lógica para enviar el email de recuperación de contraseña
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row relative">
            <div className="relative w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 flex-1 bg-cyan-900 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 1140 106"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        <path
                            opacity="0.7"
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
                                <stop stopColor="#FFFFFF" stopOpacity="0.36" />
                                <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.3" />
                                <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.096144" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <a href="/" className="absolute top-4 left-4 text-white hover:underline flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Go to home page
                </a>
                <div className="relative bg-transparent p-6 md:p-8 rounded w-full max-w-md z-10">
                    <h1 className="text-4xl md:text-4xl font-bold mb-6 text-center text-white">Vaxtrace</h1>
                    <div className="flex justify-center mb-6">
                        <Image className="h-44 w-auto md:h-20 md:hidden" src={logo} alt="Vaxtrace Logo" />
                    </div>
                    <h2 className="text-2xl md:text-2xl font-semibold mb-4 text-center text-white">Forgot your password?</h2>
                    <p className="text-xl text-white text-center mb-8">Enter your email below to receive a password reset link.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-white mb-2" htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border rounded text-black"
                                placeholder="Email"
                                required
                            />
                        </div>
                        <Button variant="outline" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition duration-200">Reset password</Button>
                        <div className="mt-6 text-center">
                            <a href="/sign-in" className="text-white hover:underline block">Have an account? Sign in</a>
                        </div>
                    </form>
                </div>
            </div>
            <div className="hidden md:flex w-full md:w-1/2 bg-white flex-col items-center justify-center p-6 md:p-12 relative flex-1">
            <div className="absolute inset-0 overflow-hidden">
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 680 1821"
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
                <Image className="h-20 md:h-40 w-auto mb-8" src={logo} alt="Vaxtrace Logo" />
                <div className="relative z-10 inline-block pt-2 md:pt-11 lg:pt-0">
                    <Image
                        src={MainImage}
                        alt="hero"
                        width={400}
                        height={300}
                        className="max-w-xs md:max-w-sm h-auto"
                    />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;