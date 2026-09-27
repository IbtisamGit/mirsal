import Layout from '../components/Layout';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import FeaturesSection from '../components/FeaturesSection';

export default function Home() {
  return (
    <Layout>
      <Hero />
      
      {/* المميزات - Features Section */}
      <FeaturesSection />
      
      {/* عن التطبيق - About Section */}
      <AboutSection />
    </Layout>
  );
}
