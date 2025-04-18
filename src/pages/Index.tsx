
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-talent-light to-white">
          <div className="container px-4 mx-auto sm:px-6">
            <div className="flex flex-col items-center text-center space-y-8">
              <h1 className="max-w-3xl gradient-text">
                Find the Perfect Assessment Tools for Your Hiring Needs
              </h1>
              <p className="max-w-2xl text-muted-foreground text-lg md:text-xl">
                Leverage our AI-powered recommendation engine to discover the most effective assessment tools for any position or skill set.
              </p>
              <Button 
                className="text-base px-6 py-6 h-auto mt-4"
                onClick={() => navigate('/recommend')}
              >
                Get Recommendations
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 mx-auto sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Our platform uses advanced vector search to match your job requirements with the most appropriate assessment tools.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-talent-light text-talent-primary mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Describe Your Needs</h3>
                <p className="text-muted-foreground">
                  Enter a job description or specific skills you're looking to assess in candidates.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-talent-light text-talent-primary mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Recommendations</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes your requirements and matches them with our database of assessment tools.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-talent-light text-talent-primary mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Choose and Deploy</h3>
                <p className="text-muted-foreground">
                  Select the best assessment for your needs and start evaluating candidates immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-muted">
          <div className="container px-4 mx-auto sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Benefits of Using Talent Compass</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Our assessment recommendation engine helps you find the perfect tools for evaluating potential candidates.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {[
                "Save time finding the right assessment tools",
                "Improve candidate evaluation accuracy",
                "Access a wide range of specialized assessments",
                "Filter by requirements like remote testing capability",
                "Get tools that adapt to candidate skill levels",
                "Find assessments in multiple languages"
              ].map((benefit, i) => (
                <div key={i} className="flex items-start p-4">
                  <CheckCircle className="h-5 w-5 mr-3 text-talent-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/recommend')}
              >
                Start Finding Assessments
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-talent-dark text-white">
          <div className="container px-4 mx-auto sm:px-6">
            <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold">Ready to Find the Perfect Assessment?</h2>
              <p className="text-talent-light">
                Start using our recommendation engine to discover assessment tools tailored to your specific hiring needs.
              </p>
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => navigate('/recommend')}
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
