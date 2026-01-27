import React from 'react';
import Navigation from './Navigation';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Benefits from './Benefits';
import Testimonials from './Testimonials';
import Pricing from './Pricing';
import FAQ from './FAQ';
import CTASection from './CTASection';
import Footer from './Footer';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950">

      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <Pricing />
      <FAQ />

      <CTASection />
      <Footer />
    </div>
  );
};

export default AppLayout;
