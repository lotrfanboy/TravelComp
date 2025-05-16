import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import MainNavbar from '@/components/layout/MainNavbar';
import {
  MapPin,
  Briefcase,
  Laptop,
  Brain,
  Globe,
  Zap,
  Share,
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

// Destinos do carrossel
const destinations = [
  {
    name: "Paris",
    tagline: "Discover the timeless romance of the City of Light",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080&q=80"
  },
  {
    name: "Bali",
    tagline: "Immerse yourself in tropical paradise and spiritual serenity",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080&q=80"
  },
  {
    name: "New York",
    tagline: "Experience the vibrant energy of the city that never sleeps",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080&q=80"
  },
  {
    name: "Tokyo",
    tagline: "Where ancient traditions meet futuristic innovations",
    image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080&q=80"
  },
  {
    name: "Cape Town",
    tagline: "Where dramatic landscapes meet vibrant urban culture",
    image: "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080&q=80"
  },
  {
    name: "Santorini",
    tagline: "Lose yourself in breathtaking sunsets and azure waters",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080&q=80"
  },
  {
    name: "Machu Picchu",
    tagline: "Journey to the ancient wonders of Incan civilization",
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080&q=80"
  },
  {
    name: "Sydney",
    tagline: "Experience the perfect blend of urban life and natural beauty",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080&q=80"
  }
];

// Destinos para o grid de inspiração
const inspirationalDestinations = [
  {
    title: "Gastronomic Adventures",
    description: "Taste the world.",
    image: "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg"
  },
  {
    title: "Tropical Island Hopping",
    description: "Hop from paradise to paradise.",
    image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg"
  },
  {
    title: "Hidden Gems of Europe",
    description: "Discover the charm of Europe's best-kept secrets.",
    image: "https://images.pexels.com/photos/2098405/pexels-photo-2098405.jpeg"
  },
  {
    title: "Epic Nature Escapes",
    description: "Reconnect with the wild.",
    image: "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg"
  },
  {
    title: "Cultural Capital Cities",
    description: "History and art at every corner.",
    image: "https://images.pexels.com/photos/3214972/pexels-photo-3214972.jpeg"
  }
];

const ModernLandingPage: React.FC = () => {
  const [_, navigate] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useTranslation();

  const handleSignIn = () => {
    navigate('/auth');
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === destinations.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? destinations.length - 1 : prev - 1));
  };

  // Auto-slide a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      {/* 1. Hero Carousel - Altura reduzida */}
      <section className="relative w-full h-[70vh] overflow-hidden">
        {destinations.map((destination, index) => (
          <div 
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/30 z-10" />
            <img 
              src={destination.image} 
              alt={destination.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 bg-gradient-to-t from-black/70 to-transparent z-20 text-white">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                  {destination.name}
                </h2>
                <p className="text-lg md:text-xl mb-6 max-w-2xl">
                  {destination.tagline}
                </p>
                <Button
                  size="lg"
                  onClick={handleSignIn}
                  className="bg-[#19B4B0] hover:bg-[#088783] text-white px-8 py-3 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {t('landing.exploreNow', 'Explore Agora')}
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Controles do carrossel */}
        <button 
          onClick={prevSlide} 
          className="absolute top-1/2 left-4 z-30 bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors duration-200"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>
        <button 
          onClick={nextSlide} 
          className="absolute top-1/2 right-4 z-30 bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors duration-200"
          aria-label="Next slide"
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </button>
        
        {/* Indicadores de slides */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
          {destinations.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Universal Product Messaging */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#434342] mb-4">
            {t('landing.forAllTravelers', 'Para turistas, nômades e viajantes corporativos — planeje sua jornada perfeita.')}
          </h2>
          <p className="text-xl text-[#434342]/80 max-w-3xl mx-auto mb-8">
            {t('landing.smartItineraries', 'Itinerários inteligentes. Atualizações em tempo real. Insights da comunidade. Tudo em um só lugar.')}
          </p>
          <Button
            onClick={() => document.getElementById('user-types')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#82C889] hover:bg-[#6DB174] text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            {t('landing.seeHowItWorks', 'Veja Como Funciona')}
          </Button>
        </div>
      </section>

      {/* 3. Inspirational Destination Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#434342] mb-10 text-center">
            {t('landing.findInspiration', 'Encontre Inspiração Para Sua Próxima Jornada')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {inspirationalDestinations.map((destination, index) => (
              <div 
                key={index} 
                className="group relative h-80 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={handleSignIn}
              >
                <img 
                  src={destination.image} 
                  alt={destination.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white font-bold text-xl mb-2">{destination.title}</h3>
                  <p className="text-white/90 text-sm">{destination.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. User-Type Specific Cards */}
      <section id="user-types" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#434342] mb-10 text-center">
            {t('landing.tailoredForEveryTraveler', 'Personalizado Para Cada Viajante')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Travelers Card */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-[#88C2BF]/20 hover:border-[#88C2BF]">
              <div className="h-16 w-16 bg-[#88C2BF]/10 rounded-full flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-[#88C2BF]" />
              </div>
              <h3 className="text-xl font-bold text-[#434342] mb-3">Your personal travel assistant</h3>
              <p className="text-[#434342]/80 mb-6">
                Create seamless itineraries, discover hidden gems, and travel stress-free.
              </p>
              <Button
                onClick={handleSignIn}
                variant="outline"
                className="w-full border-[#88C2BF] text-[#88C2BF] hover:bg-[#88C2BF]/10"
              >
                Start exploring
              </Button>
            </div>

            {/* Digital Nomads Card */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-[#19B4B0]/20 hover:border-[#19B4B0]">
              <div className="h-16 w-16 bg-[#19B4B0]/10 rounded-full flex items-center justify-center mb-6">
                <Laptop className="h-8 w-8 text-[#19B4B0]" />
              </div>
              <h3 className="text-xl font-bold text-[#434342] mb-3">Work anywhere, plan everything</h3>
              <p className="text-[#434342]/80 mb-6">
                Keep track of tasks, finances, and plans in one place.
              </p>
              <Button
                onClick={handleSignIn}
                variant="outline"
                className="w-full border-[#19B4B0] text-[#19B4B0] hover:bg-[#19B4B0]/10"
              >
                Discover workspaces
              </Button>
            </div>

            {/* Companies Card */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-[#82C889]/20 hover:border-[#82C889]">
              <div className="h-16 w-16 bg-[#82C889]/10 rounded-full flex items-center justify-center mb-6">
                <Briefcase className="h-8 w-8 text-[#82C889]" />
              </div>
              <h3 className="text-xl font-bold text-[#434342] mb-3">Corporate travel made smarter</h3>
              <p className="text-[#434342]/80 mb-6">
                Plan team trips, track costs, and measure impact.
              </p>
              <Button
                onClick={handleSignIn}
                variant="outline"
                className="w-full border-[#82C889] text-[#82C889] hover:bg-[#82C889]/10"
              >
                Optimize business travel
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Redesigned "Powerful Features" Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#434342] mb-4 text-center">
            {t('landing.powerfulFeatures', 'Recursos Poderosos')}
          </h2>
          <p className="text-[#434342]/80 text-center max-w-2xl mx-auto mb-12">
            {t('landing.everythingYouNeed', 'Equipado com tudo que você precisa para um planejamento de viagem sem estresse')}
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* AI-Powered Planning */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center">
              <div className="h-16 w-16 bg-[#19B4B0]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-[#19B4B0]" />
              </div>
              <h3 className="text-lg font-bold text-[#434342] mb-2">AI-Powered Planning</h3>
              <p className="text-sm text-[#434342]/70">
                Personalized itineraries created just for you based on your preferences.
              </p>
            </div>
            
            {/* Worldwide Info */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center">
              <div className="h-16 w-16 bg-[#88C2BF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-[#88C2BF]" />
              </div>
              <h3 className="text-lg font-bold text-[#434342] mb-2">Worldwide Info</h3>
              <p className="text-sm text-[#434342]/70">
                Comprehensive details for destinations across the globe.
              </p>
            </div>
            
            {/* Instant Alerts */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center">
              <div className="h-16 w-16 bg-[#82C889]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-[#82C889]" />
              </div>
              <h3 className="text-lg font-bold text-[#434342] mb-2">Instant Alerts</h3>
              <p className="text-sm text-[#434342]/70">
                Real-time notifications and updates about your travel plans.
              </p>
            </div>
            
            {/* Share Instantly */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center">
              <div className="h-16 w-16 bg-[#19B4B0]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share className="h-8 w-8 text-[#19B4B0]" />
              </div>
              <h3 className="text-lg font-bold text-[#434342] mb-2">Share Instantly</h3>
              <p className="text-sm text-[#434342]/70">
                Easily share your travel plans with friends, family, or colleagues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#19B4B0] to-[#88C2BF] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landing.readyToStartJourney', 'Pronto para começar sua jornada?')}</h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
            {t('landing.joinThousands', 'Junte-se a milhares de viajantes que já estão economizando tempo e aproveitando mais suas viagens.')}
          </p>
          <Button
            size="lg"
            onClick={handleSignIn}
            className="bg-white text-[#19B4B0] hover:bg-gray-100 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Get Started For Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#434342] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <svg className="h-8 w-8 text-[#19B4B0]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1C7.6,1,4,4.6,4,9c0,4.1,3.8,9.7,7.1,13.4c0.6,0.6,1.5,0.6,2.1,0C16.2,18.7,20,13.1,20,9C20,4.6,16.4,1,12,1z M12,13c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S14.2,13,12,13z"></path>
                </svg>
                <span className="ml-2 text-xl font-bold text-white">Voyagewise</span>
              </div>
              <p className="mt-4 text-sm text-white/80">
                Travel planning simplified for tourists, digital nomads, and business travelers.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Features</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-white/70 hover:text-white">Trip Planning</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white">AI Recommendations</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white">Workspace Finder</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white">Budget Tracking</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-white/70 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-white/70 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between">
            <p className="text-sm text-white/70">© 2023 Voyagewise. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-white/70 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-white/70 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-white/70 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernLandingPage;