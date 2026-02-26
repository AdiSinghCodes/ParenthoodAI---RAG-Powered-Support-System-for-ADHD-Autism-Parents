import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import TeamMember, { TeamMemberProps } from '@/components/home/TeamMember';
import FeatureCard from '@/components/home/FeatureCard';
import { MessageCircle, User, Users, Bell } from 'lucide-react';

const teamMembers: TeamMemberProps[] = [
  {
    name: 'Rohit Gupta',
    role: 'AI and frontend developer',
    image: '/public/Rohit.jpg',
    description: 'Specializes in integrating AI models with user-friendly frontend interfaces to enhance chatbot experiences.',
    linkedinUrl: 'https://www.linkedin.com/in/rohit-gupta-687b9829a/',
    emailAddress: 'rohitgupta87798@gmail.com',
  },
  {
    name: 'Kamraan Mulani',
    role: 'AI and backend developer',
    image: '/public/kamraan.jpg',
    description: 'Focuses on backend systems and AI pipelines to ensure robust and scalable data-driven interactions.',
    linkedinUrl: 'https://www.linkedin.com/in/kamraan-mulani-944166223/',
    emailAddress: 'kamraanmulani8284@gmail.com',
  },
  {
    name: 'Aditya Singh',
    role: 'Frontend developer',
    image: '/public/aditya.jpg',
    description: 'Crafts responsive UI components and ensures smooth user journeys across devices and browsers.',
    linkedinUrl: 'https://www.linkedin.com/in/aditya-singh-2b319b299/',
    emailAddress: 'adityapsingh565@gmail.com',
  },
  {
    name: 'Afraz Hussain',
    role: 'Frontend developer',
    image: '/public/afraz.jpg',
    description: 'Implements modern design principles to build clean, accessible, and interactive user interfaces.',
    linkedinUrl: 'https://www.linkedin.com/in/afraz-hussain-60614b29a/',
    emailAddress: 'afrazanwarhussain@gmail.com',
  },
];

const features = [
  {
    title: 'Personalized Advice',
    description: "Get customized parenting guidance based on your child's age, temperament, and your family situation.",
    icon: <User className="h-5 w-5 text-primary" />,
  },
  {
    title: 'Community Support',
    description: "Access a network of parents and experts who understand what you're going through.",
    icon: <Users className="h-5 w-5 text-primary" />,
  },
  {
    title: '24/7 Availability',
    description: 'Get help anytime, day or night, when parenting questions or challenges arise.',
    icon: <Bell className="h-5 w-5 text-primary" />,
  },
  {
    title: 'Expert Knowledge',
    description: 'Our AI is trained on the latest research in child development and evidence-based parenting approaches.',
    icon: <MessageCircle className="h-5 w-5 text-primary" />,
  },
];

const Index: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 md:py-32 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-6 animate-fade-in">
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-full mb-4">
                  ✨ AI-Powered Parenting Support
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Your AI Parenting
                  </span>
                  <span className="block text-gray-900 mt-2">Assistant</span>
                </h1>
                <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
                  Get expert guidance, support, and answers for all your parenting questions, day or night. Specialized in ADHD & Autism support.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/chat">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Start Chatting
                  </Button>
                </Link>
                <Link to="/activity">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-all transform hover:scale-105">
                    Start Activity
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-white animate-fade-in-delay">
              <img
                src="/public/logo.png"
                alt="ParenthoodAI Screenshot"
                width={550}
                height={400}
                className="aspect-video object-cover w-full transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                How ParenthoodAI Helps You
              </span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI assistant is designed specifically for parents like you.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white text-sm font-semibold mb-4">
              Why Choose ParenthoodAI
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Trusted by Parents Worldwide
              </span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Supporting families with evidence-based guidance and compassionate AI assistance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stat Card 1 */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-indigo-100 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">10,000+</h3>
              <p className="text-gray-600 font-medium">Active Parents</p>
              <p className="text-sm text-gray-500 mt-2">Using our platform daily</p>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-purple-100 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">50,000+</h3>
              <p className="text-gray-600 font-medium">Conversations</p>
              <p className="text-sm text-gray-500 mt-2">Helpful guidance provided</p>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-pink-100 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">95%</h3>
              <p className="text-gray-600 font-medium">Satisfaction Rate</p>
              <p className="text-sm text-gray-500 mt-2">Parents recommend us</p>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-indigo-100 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">24/7</h3>
              <p className="text-gray-600 font-medium">Available</p>
              <p className="text-sm text-gray-500 mt-2">Always here when you need</p>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-2xl font-bold mb-3">AI-Powered Insights</h3>
              <p className="text-white/90">Advanced AI trained on pediatric expertise to provide personalized guidance for ADHD and Autism support.</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-8 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-3">Private & Secure</h3>
              <p className="text-white/90">Your conversations are encrypted and private. We prioritize your family's privacy and data security.</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-red-500 p-8 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl mb-4">💝</div>
              <h3 className="text-2xl font-bold mb-3">Compassionate Care</h3>
              <p className="text-white/90">Empathetic responses that understand your challenges and celebrate your child's unique strengths.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container px-4 md:px-6 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="mb-10 text-xl text-white/90 leading-relaxed">
              Join thousands of parents who are already using ParenthoodAI for support and guidance. Get personalized AI assistance for your parenting journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/chat">
                <Button size="lg" className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-gray-100 font-semibold shadow-xl transform hover:scale-105 transition-all">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chat with ParenthoodAI
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 font-semibold transform hover:scale-105 transition-all">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
