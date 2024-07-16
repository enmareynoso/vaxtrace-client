import React, { useState } from 'react';
import Image from 'next/image';
import logo from '../../images/logo.png';
import MainImage from '../../images/heroImage.png';

const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Email:', email);
        console.log('Password:', password);
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-4 md:p-10 relative flex-1">
                <a href="/" className="absolute top-4 left-4 text-gray-800 hover:underline flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Go to home page
                </a>
                <Image className="h-20 md:h-40 w-auto mb-4" src={logo} alt="Vaxtrace Logo" />
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
            <div className="w-full md:w-1/2 bg-cyan-900 flex items-center justify-center p-4 md:p-10 flex-1">
                <div className="bg-transparent p-4 md:p-8 rounded w-full max-w-md">
                    <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center text-white">Vaxtrace</h1>
                    <h2 className="text-xl md:text-2xl font-bold mb-6 text-center text-white">Sign In</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-white">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="Email"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-white">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="Password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition duration-200"
                        >
                            Login
                        </button>
                        <div className="mt-4 text-center">
                            <a href="#" className="text-white hover:underline">Forgot Password?</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
