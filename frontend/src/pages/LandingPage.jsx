import Navbar from '../components/landing/Navbar'
import HeroSection from '../components/landing/HeroSection'
import StatsBar from '../components/landing/StatsBar'
import FeaturesSection from '../components/landing/FeaturesSection'
import HowItWorks from '../components/landing/HowItWorks'
import TechStack from '../components/landing/TechStack'
import CTASection from '../components/landing/CTASection'
import Footer from '../components/landing/Footer'

// ============================================
// LANDING PAGE
// Standalone page — does NOT use MainLayout
// Has its own Navbar and Footer
// Route: /
// All sections stacked top to bottom
// Reorder sections by moving lines here
// ============================================

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <HowItWorks />
      <TechStack />
      <CTASection />
      <Footer />
    </div>
  )
}