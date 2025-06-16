
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Shield, Brain, Clock, Users, Heart, Zap, Globe } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Empathetic Conversations",
    description: "Engage in meaningful dialogue with AI trained on therapeutic best practices and genuine empathy."
  },
  {
    icon: Shield,
    title: "Complete Privacy",
    description: "Your conversations are encrypted and private. We never share your personal information."
  },
  {
    icon: Brain,
    title: "Evidence-Based Techniques",
    description: "Our AI utilizes proven therapeutic methods including CBT, DBT, and mindfulness practices."
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Access support whenever you need it, day or night, without appointments or waiting lists."
  },
  {
    icon: Users,
    title: "Personalized Support",
    description: "Receive tailored guidance that adapts to your unique needs and therapeutic goals."
  },
  {
    icon: Heart,
    title: "Crisis Support",
    description: "Immediate assistance for urgent situations with appropriate resource recommendations."
  },
  {
    icon: Zap,
    title: "Instant Response",
    description: "Get immediate feedback and support without the typical delays of traditional therapy."
  },
  {
    icon: Globe,
    title: "Accessible Anywhere",
    description: "Connect from anywhere in the world with just an internet connection."
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-calm-900 mb-6 font-playfair">
            Why Choose Polariz Therapy AI?
          </h2>
          <p className="text-xl text-calm-600 max-w-3xl mx-auto">
            Experience the future of mental health support with our advanced AI platform 
            designed to provide compassionate, professional, and accessible therapy.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-therapy-200 hover:border-therapy-300 transition-all duration-300 hover:shadow-lg group"
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-gradient-therapy rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-calm-800">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-calm-600 text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
