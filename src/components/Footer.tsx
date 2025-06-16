
import { Link } from "react-router-dom";
import { MessageCircle, Shield, Heart, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-calm-900 text-calm-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-therapy rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient font-playfair">
                Polariz.therapy.ai
              </span>
            </Link>
            <p className="text-calm-300 mb-4 max-w-md">
              Providing compassionate, AI-powered mental health support to help you thrive. 
              Available 24/7 with complete privacy and professional-grade care.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-calm-400">
                <Shield className="w-4 h-4 mr-1" />
                HIPAA Compliant
              </div>
              <div className="flex items-center text-sm text-calm-400">
                <Heart className="w-4 h-4 mr-1" />
                Crisis Support
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/chat" className="text-calm-300 hover:text-therapy-400 transition-colors">
                  Start Session
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-calm-300 hover:text-therapy-400 transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-calm-300 hover:text-therapy-400 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-calm-300 hover:text-therapy-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-calm-300 hover:text-therapy-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-calm-300 hover:text-therapy-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-calm-300 hover:text-therapy-400 transition-colors">
                  Crisis Resources
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-calm-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-calm-400 text-sm mb-4 md:mb-0">
            © 2024 Polariz Therapy AI. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm text-calm-400">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              support@polariz.therapy.ai
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              Crisis: 988
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
