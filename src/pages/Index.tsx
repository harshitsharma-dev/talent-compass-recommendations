
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ApiStatusChecker from '@/components/ApiStatusChecker';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-10">
        <div className="container px-4 mx-auto sm:px-6">
          <section className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-6">Assessment Recommendation Engine</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find the perfect assessment tools for your hiring needs using our AI-powered recommendation engine
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/recommend">Find Assessments</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/results">Browse All</Link>
              </Button>
            </div>
          </section>
          
          <div className="max-w-md mx-auto mb-12">
            <ApiStatusChecker />
          </div>
          
          <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <div className="border rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">AI-Powered Search</h2>
              <p className="text-muted-foreground">
                Our system uses advanced AI to match your requirements with the most suitable assessment tools.
              </p>
            </div>
            <div className="border rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Comprehensive Database</h2>
              <p className="text-muted-foreground">
                Access a wide range of assessment tools from leading providers in the industry.
              </p>
            </div>
            <div className="border rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Detailed Insights</h2>
              <p className="text-muted-foreground">
                Get detailed information about each assessment tool to make informed decisions.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
