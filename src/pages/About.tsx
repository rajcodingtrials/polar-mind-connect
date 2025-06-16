
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Heart, Brain, Users, Award, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-therapy-50 via-white to-calm-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-calm-900 mb-6 font-playfair">
            About Polariz Therapy AI
          </h1>
          <p className="text-xl text-calm-600 max-w-3xl mx-auto">
            Revolutionizing mental health support through compassionate AI technology, 
            making quality therapy accessible to everyone, everywhere.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12 border-therapy-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-playfair text-calm-900">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-calm-700 text-center leading-relaxed max-w-4xl mx-auto">
              We believe that everyone deserves access to quality mental health support. Our AI-powered platform 
              combines evidence-based therapeutic techniques with advanced technology to provide compassionate, 
              personalized care that's available whenever you need it most.
            </p>
          </CardContent>
        </Card>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-calm-900 text-center mb-12 font-playfair">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Heart,
                title: "Compassion",
                description: "Every interaction is guided by empathy and genuine care for your wellbeing."
              },
              {
                icon: Shield,
                title: "Privacy",
                description: "Your conversations are completely confidential and securely protected."
              },
              {
                icon: Brain,
                title: "Evidence-Based",
                description: "Our approach is grounded in proven therapeutic methods and research."
              },
              {
                icon: Users,
                title: "Accessibility",
                description: "Mental health support should be available to everyone, regardless of barriers."
              }
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center border-therapy-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-gradient-therapy rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-calm-800">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-calm-600 leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-calm-900 text-center mb-12 font-playfair">
            How Polariz Works
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Start Safely",
                description: "Begin with a secure, private conversation in our judgment-free environment."
              },
              {
                step: "2",
                title: "Share Openly",
                description: "Express your thoughts and feelings with our AI companion trained in therapeutic techniques."
              },
              {
                step: "3",
                title: "Receive Support",
                description: "Get personalized guidance, coping strategies, and emotional support tailored to your needs."
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-therapy rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-calm-800 mb-4">{step.title}</h3>
                <p className="text-calm-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-calm-900 text-center mb-12 font-playfair">
            Why Choose Polariz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              "24/7 availability with no appointments needed",
              "Complete privacy and HIPAA-compliant security",
              "Evidence-based therapeutic approaches (CBT, DBT, Mindfulness)",
              "Personalized responses that adapt to your unique needs",
              "Crisis support with appropriate resource recommendations",
              "No waiting lists or insurance requirements",
              "Accessible from anywhere with an internet connection",
              "Culturally sensitive and inclusive support"
            ].map((feature, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <p className="text-calm-700">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Ethics */}
        <Card className="mb-12 bg-calm-50 border-calm-200">
          <CardHeader>
            <CardTitle className="text-2xl font-playfair text-calm-900 flex items-center">
              <Shield className="w-6 h-6 mr-3" />
              Safety & Ethics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-calm-800 mb-3">Our Commitment</h3>
                <ul className="space-y-2 text-calm-700">
                  <li>• Never replace professional medical advice</li>
                  <li>• Recognize and respond to crisis situations</li>
                  <li>• Maintain strict confidentiality standards</li>
                  <li>• Provide culturally competent support</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-calm-800 mb-3">Important Disclaimers</h3>
                <ul className="space-y-2 text-calm-700">
                  <li>• AI support complements but doesn't replace therapy</li>
                  <li>• Crisis situations require human intervention</li>
                  <li>• We encourage professional help when needed</li>
                  <li>• Your safety is our top priority</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-therapy text-white text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-playfair">
              Ready to Begin Your Journey?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-therapy-100 mb-6 text-lg">
              Take the first step towards better mental health with compassionate AI support that's always available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-therapy-600 hover:bg-therapy-50 px-6 py-3 rounded-lg font-semibold transition-colors">
                Start Free Session
              </button>
              <button className="border border-white text-white hover:bg-white hover:text-therapy-600 px-6 py-3 rounded-lg font-semibold transition-colors">
                Explore Resources
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
