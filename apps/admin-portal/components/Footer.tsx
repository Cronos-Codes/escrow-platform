'use client';

import { 
  Box,
  Typography,
  Container,
  Grid,
  Link,
  IconButton
} from '@mui/material';
import { 
  IconHeart, 
  IconBrandGithub, 
  IconBrandTwitter, 
  IconBrandLinkedin,
  IconMail,
  IconPhone,
  IconMapPin
} from '@tabler/icons-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-lg">Gold Escrow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Secure, transparent, and reliable escrow services for digital assets and traditional transactions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <IconBrandGithub className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <IconBrandTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <IconBrandLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Digital Asset Escrow</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Traditional Escrow</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Dispute Resolution</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Smart Contracts</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <IconMail className="h-4 w-4" />
                <span>support@goldescrow.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconPhone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconMapPin className="h-4 w-4" />
                <span>123 Blockchain St, Crypto City</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Gold Escrow. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>

        {/* Made with Love */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          Made with <IconHeart className="inline h-4 w-4 text-red-500" /> for secure transactions
        </div>
      </div>
    </footer>
  );
}
