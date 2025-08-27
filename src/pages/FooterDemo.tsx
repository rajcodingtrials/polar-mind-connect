import React from "react";
import Header from "@/components/Header";
import FooterCardStyle from "@/components/FooterCardStyle";
import FooterFloating from "@/components/FooterFloating";
import FooterEnhanced from "@/components/FooterEnhanced";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const FooterDemo = () => {
  const [activeFooter, setActiveFooter] = useState<'original' | 'enhanced' | 'card' | 'floating'>('original');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Footer Style Demo</h1>
          <p className="text-muted-foreground mb-8">Compare different footer styles for the Polariz website</p>
          
          {/* Style Selector */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Choose Footer Style</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant={activeFooter === 'original' ? 'default' : 'outline'}
                  onClick={() => setActiveFooter('original')}
                >
                  Original Footer
                </Button>
                <Button 
                  variant={activeFooter === 'enhanced' ? 'default' : 'outline'}
                  onClick={() => setActiveFooter('enhanced')}
                >
                  Enhanced Original
                </Button>
                <Button 
                  variant={activeFooter === 'card' ? 'default' : 'outline'}
                  onClick={() => setActiveFooter('card')}
                >
                  Card Style Footer
                </Button>
                <Button 
                  variant={activeFooter === 'floating' ? 'default' : 'outline'}
                  onClick={() => setActiveFooter('floating')}
                >
                  Floating Navigation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content Area */}
          <div className="space-y-8 mb-16">
            <Card>
              <CardHeader>
                <CardTitle>Style Descriptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Original Footer</h3>
                  <p className="text-muted-foreground text-sm">Simple horizontal layout with logo, copyright, and navigation links</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Enhanced Original</h3>
                  <p className="text-muted-foreground text-sm">Improved version with gradient backgrounds, hover effects, and better typography</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Card Style Footer</h3>
                  <p className="text-muted-foreground text-sm">Modern card-based layout with organized sections for brand, navigation, and contact info</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Floating Navigation</h3>
                  <p className="text-muted-foreground text-sm">Minimal footer with floating sidebar containing navigation links in bottom-right corner</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Sample Content</h3>
                <p className="text-muted-foreground mb-4">
                  This is sample content to demonstrate how the footer appears with page content. 
                  The footer styles showcase different approaches to organizing navigation and branding elements.
                </p>
                <p className="text-muted-foreground">
                  Scroll down to see the selected footer style in action. The floating navigation style 
                  will show a floating element in the bottom-right corner.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Render Selected Footer */}
      {activeFooter === 'original' && <Footer />}
      {activeFooter === 'enhanced' && <FooterEnhanced />}
      {activeFooter === 'card' && <FooterCardStyle />}
      {activeFooter === 'floating' && <FooterFloating />}
    </div>
  );
};

export default FooterDemo;