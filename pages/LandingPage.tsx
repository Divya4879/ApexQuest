import React from 'react';
import { CHANNELS } from '../constants';
import { Channel } from '../types';

interface LandingPageProps {
  onLogin: () => void;
}

// SVG Icon Components
const ShareIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);
const CommunityIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);
const AiIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" transform="translate(0 -4)" strokeOpacity="0.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" transform="translate(0 4)" strokeOpacity="0.5" />
    </svg>
);


const LandingPage = ({ onLogin }: LandingPageProps) => {
  return (
    <div className="bg-gray-900 text-white font-sans">
      <div className="relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
            <div className="h-[600px] w-[600px] bg-gradient-to-br from-purple-600 to-blue-500 rounded-full opacity-20 filter blur-3xl animate-blob"></div>
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2">
            <div className="h-[500px] w-[500px] bg-gradient-to-br from-pink-500 to-orange-400 rounded-full opacity-20 filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        <div className="absolute bottom-0 left-1/4 -translate-y-1/2">
            <div className="h-[400px] w-[400px] bg-gradient-to-br from-teal-400 to-green-500 rounded-full opacity-20 filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      
        <main className="relative z-10">
            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 drop-shadow-2xl" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                    ApexQuest
                </h1>
                <h2 className="text-2xl md:text-3xl  font-light text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                    Embark on a quest for growth. Share your journey, track your progress, and achieve your goals with a supportive community powered by AI insights.
                </h2>
                
                <button
                    onClick={onLogin}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300"
                >
                    Get Started
                </button>
            </section>

            {/* Categories Section */}
            <section className="py-20 sm:py-32">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{fontFamily: 'Poppins, system-ui, sans-serif'}}>Find Your Challenge</h2>
                        <p className="text-gray-400 md:text-lg">No matter your goal, there’s a community here for you. Explore our channels and join as many as you like to start your journey.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-12">
                        {CHANNELS.map(channel => (
                            <div key={channel.id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/80 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
                                <span className="text-4xl">{channel.emoji}</span>
                                <h3 className="font-bold text-lg mt-4 text-white">{channel.name}</h3>
                                <p className="text-gray-400 mt-2 text-sm">{channel.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 sm:py-32 bg-gray-900/50">
                 <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{fontFamily: 'Poppins, system-ui, sans-serif'}}>Everything You Need to Succeed</h2>
                        <p className="text-gray-400 md:text-lg">We provide the tools to help you stay motivated and on track, every step of the way.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 mt-16 text-center">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 text-blue-300 mb-4">
                               <ShareIcon className="h-8 w-8" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Share Your Progress</h3>
                            <p className="text-gray-400">Post updates, milestones, and even setbacks. Your journey inspires others and keeps you accountable.</p>
                        </div>
                         <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 text-purple-300 mb-4">
                                <CommunityIcon className="h-8 w-8" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Engage with Community</h3>
                            <p className="text-gray-400">Get encouragement, advice, and feedback. Like, comment, and connect with people on the same path.</p>
                        </div>
                         <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 text-pink-300 mb-4">
                                <AiIcon className="h-8 w-8" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">AI-Powered Insights</h3>
                            <p className="text-gray-400">Ask our AI agent about your posts and engagement to understand sentiment and get feedback.</p>
                        </div>
                    </div>
                 </div>
            </section>
            
            {/* Final CTA Section */}
            <section className="py-20 text-center">
                 <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white" style={{fontFamily: 'Poppins, system-ui, sans-serif'}}>Ready for Your ApexQuest?</h2>
                    <button
                        onClick={onLogin}
                        className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300"
                    >
                        Join the Community
                    </button>
                 </div>
            </section>
        </main>
        
        <footer className="relative z-10 border-t border-gray-800 py-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ApexQuest by Divya. All rights reserved.
        </footer>
      </div>

      <style>{`
        .animate-blob {
          animation: blob 10s infinite;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;