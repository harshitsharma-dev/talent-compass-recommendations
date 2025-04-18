
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 text-white rounded-md bg-talent-primary">
            <AlertCircle size={18} />
          </div>
          <span className="font-semibold text-talent-primary">Talent Compass</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-foreground hover:text-talent-primary transition-colors">
            Home
          </Link>
          <Link to="/recommend" className="text-foreground hover:text-talent-primary transition-colors">
            Find Assessments
          </Link>
          <Link to="/" className="text-foreground hover:text-talent-primary transition-colors">
            About
          </Link>
        </nav>
        
        <div>
          <Link 
            to="/recommend"
            className="inline-flex items-center justify-center h-9 rounded-md bg-talent-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-talent-dark focus:outline-none focus:ring-2 focus:ring-talent-primary focus:ring-offset-2"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
