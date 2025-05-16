import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Briefcase,
  Laptop,
  UserCheck,
  Globe,
  Clock,
  BellRing,
  Share2,
  CheckCircle2
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [_, navigate] = useLocation();

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,1C7.6,1,4,4.6,4,9c0,4.1,3.8,9.7,7.1,13.4c0.6,0.6,1.5,0.6,2.1,0C16.2,18.7,20,13.1,20,9C20,4.6,16.4,1,12,1z M12,13c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S14.2,13,12,13z"></path>
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">Voyagewise</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button
                onClick={handleSignIn}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        {/* Background pattern */}
        <div className="absolute inset-0 z-0 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 20 L40 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-300" />
                <path d="M20 0 L20 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-300" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                <span className="block text-gray-900">Your journey begins</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-600 mt-2">
                  with perfect planning
                </span>
              </h1>
              
              <p className="mt-6 text-xl leading-relaxed text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Whether you're a tourist exploring new places, a digital nomad seeking workspaces, 
                or a business traveler coordinating team trips, Voyagewise has your journey covered.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={handleSignIn} 
                  className="px-10 py-6 text-lg rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-900 hover:to-slate-950 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Start Planning
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('#features')} 
                  className="px-10 py-6 text-lg rounded-xl border-2 shadow-sm hover:shadow transition-all duration-200"
                >
                  Learn More
                </Button>
              </div>

              <div className="mt-12 flex items-center space-x-6 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  <img className="h-12 w-12 rounded-full border-2 border-white shadow-md" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32&q=80" alt="User" />
                  <img className="h-12 w-12 rounded-full border-2 border-white shadow-md" src="https://images.unsplash.com/photo-1506863530036-1efeddceb993?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32&q=80" alt="User" />
                  <img className="h-12 w-12 rounded-full border-2 border-white shadow-md" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32&q=80" alt="User" />
                </div>
                <p className="text-base text-gray-600">
                  <span className="font-semibold text-gray-900 text-lg">5,000+</span> travelers trust us
                </p>
              </div>
            </div>

            {/* Hero images grid */}
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl shadow-2xl h-64">
                    <img 
                      src="https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80" 
                      alt="Paris cityscape" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl shadow-2xl h-44">
                    <img 
                      src="https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80" 
                      alt="Beach sunset" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="overflow-hidden rounded-2xl shadow-2xl h-44">
                    <img 
                      src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80" 
                      alt="Mountain view" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl shadow-2xl h-64">
                    <img 
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=600&q=80" 
                      alt="Coworking space" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                </div>
              </div>
              
              {/* User type indicators */}
              <div className="absolute -right-4 -bottom-4 grid grid-cols-3 gap-3 bg-white p-4 rounded-xl shadow-xl">
                <div className="bg-gradient-to-b from-yellow-50 to-yellow-100 p-3 rounded-lg text-center">
                  <MapPin className="h-7 w-7 mx-auto text-yellow-500 mb-1" />
                  <p className="font-semibold text-yellow-700">Tourist</p>
                </div>
                <div className="bg-gradient-to-b from-emerald-50 to-emerald-100 p-3 rounded-lg text-center">
                  <Laptop className="h-7 w-7 mx-auto text-emerald-500 mb-1" />
                  <p className="font-semibold text-emerald-700">Nomad</p>
                </div>
                <div className="bg-gradient-to-b from-indigo-50 to-indigo-100 p-3 rounded-lg text-center">
                  <Briefcase className="h-7 w-7 mx-auto text-indigo-500 mb-1" />
                  <p className="font-semibold text-indigo-700">Business</p>
                </div>
              </div>
            </div>

            {/* Mobile image carousel - visible only on small screens */}
            <div className="block lg:hidden overflow-hidden rounded-2xl shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=800&q=80" 
                alt="Paris cityscape" 
                className="w-full object-cover" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Tailored for Every Traveler</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Customize your travel planning experience based on your unique needs
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {/* Tourist */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">For Tourists</h3>
              <p className="mt-2 text-gray-600">
                Discover attractions, local experiences, and create the perfect vacation itinerary.
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm">Tourist attraction highlights</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm">Restaurant & dining recommendations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm">Cultural experience planning</span>
                </li>
              </ul>
            </div>

            {/* Digital Nomad */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Laptop className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">For Digital Nomads</h3>
              <p className="mt-2 text-gray-600">
                Find coworking spaces, check wifi speeds, and plan long-term stays with local insights.
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2" />
                  <span className="text-sm">Coworking space directory</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2" />
                  <span className="text-sm">Visa & long-term stay information</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2" />
                  <span className="text-sm">Digital nomad community connections</span>
                </li>
              </ul>
            </div>

            {/* Business */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">For Business Travelers</h3>
              <p className="mt-2 text-gray-600">
                Coordinate team trips, track expenses, and ensure policy compliance for business travel.
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-sm">Multi-user trip coordination</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-sm">Expense tracking & reporting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-sm">Travel policy compliance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Powerful Features</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Equipped with everything you need for stress-free travel planning
            </p>
          </div>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Personalized Plans</h3>
              <p className="mt-2 text-sm text-gray-600">
                AI-generated itineraries based on your preferences and travel style.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Global Coverage</h3>
              <p className="mt-2 text-sm text-gray-600">
                Detailed information for destinations worldwide.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                <BellRing className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Real-time Updates</h3>
              <p className="mt-2 text-sm text-gray-600">
                Stay informed with notifications about your trip.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Share2 className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Easy Sharing</h3>
              <p className="mt-2 text-sm text-gray-600">
                Share your travel plans with friends or colleagues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-500 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to start your journey?</h2>
          <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">
            Join thousands of travelers who plan their trips with Voyagewise.
          </p>
          <div className="mt-8">
            <Button 
              size="lg" 
              onClick={handleSignIn} 
              className="bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-900 hover:to-slate-950 px-8 py-3 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1C7.6,1,4,4.6,4,9c0,4.1,3.8,9.7,7.1,13.4c0.6,0.6,1.5,0.6,2.1,0C16.2,18.7,20,13.1,20,9C20,4.6,16.4,1,12,1z M12,13c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S14.2,13,12,13z"></path>
                </svg>
                <span className="ml-2 text-xl font-bold text-white">Voyagewise</span>
              </div>
              <p className="mt-4 text-sm">
                Travel planning simplified for tourists, digital nomads, and business travelers.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Features</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm hover:text-white">Trip Planning</a></li>
                <li><a href="#" className="text-sm hover:text-white">AI Recommendations</a></li>
                <li><a href="#" className="text-sm hover:text-white">Workspace Finder</a></li>
                <li><a href="#" className="text-sm hover:text-white">Budget Tracking</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm hover:text-white">About Us</a></li>
                <li><a href="#" className="text-sm hover:text-white">Careers</a></li>
                <li><a href="#" className="text-sm hover:text-white">Blog</a></li>
                <li><a href="#" className="text-sm hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-sm hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-sm hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between">
            <p className="text-sm">© 2023 Voyagewise. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
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

export default LandingPage;
