
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Headphones, Video, Phone, Download, ExternalLink, Heart, Brain, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const resources = [
  {
    category: "Crisis Support",
    icon: Phone,
    items: [
      {
        title: "National Suicide Prevention Lifeline",
        description: "24/7 free and confidential support for people in distress",
        contact: "988",
        type: "hotline"
      },
      {
        title: "Crisis Text Line",
        description: "Text-based crisis support available 24/7",
        contact: "Text HOME to 741741",
        type: "text"
      },
      {
        title: "National Domestic Violence Hotline",
        description: "Support for domestic violence survivors",
        contact: "1-800-799-7233",
        type: "hotline"
      }
    ]
  },
  {
    category: "Self-Help Tools",
    icon: Brain,
    items: [
      {
        title: "Guided Meditation Library",
        description: "Mindfulness exercises for anxiety, stress, and sleep",
        action: "Access Now",
        type: "tool"
      },
      {
        title: "Mood Tracking Journal",
        description: "Track your emotional patterns and triggers",
        action: "Start Tracking",
        type: "tool"
      },
      {
        title: "Breathing Exercises",
        description: "Techniques for managing anxiety and panic",
        action: "Learn Techniques",
        type: "tool"
      }
    ]
  },
  {
    category: "Educational Resources",
    icon: BookOpen,
    items: [
      {
        title: "Understanding Anxiety Disorders",
        description: "Comprehensive guide to anxiety symptoms and management",
        action: "Read Guide",
        type: "article"
      },
      {
        title: "Depression: Signs and Support",
        description: "Recognizing depression and finding help",
        action: "Learn More",
        type: "article"
      },
      {
        title: "Building Resilience",
        description: "Strategies for developing emotional resilience",
        action: "Access Course",
        type: "course"
      }
    ]
  },
  {
    category: "Professional Help",
    icon: Heart,
    items: [
      {
        title: "Find a Therapist",
        description: "Directory of licensed mental health professionals",
        action: "Search Now",
        type: "directory"
      },
      {
        title: "Therapy Types Explained",
        description: "Understanding different therapeutic approaches",
        action: "Explore Options",
        type: "guide"
      },
      {
        title: "Insurance & Costs",
        description: "Understanding mental health coverage and options",
        action: "Get Info",
        type: "guide"
      }
    ]
  }
];

const Resources = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-therapy-50 via-white to-calm-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-calm-900 mb-6 font-playfair">
            Mental Health Resources
          </h1>
          <p className="text-xl text-calm-600 max-w-3xl mx-auto">
            Comprehensive support tools, crisis resources, and educational materials to help you on your mental health journey.
          </p>
        </div>

        {/* Crisis Alert */}
        <Card className="mb-12 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Need Immediate Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              If you're experiencing a mental health crisis or having thoughts of self-harm, please reach out for immediate support:
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-red-600 hover:bg-red-700">
                <Phone className="w-4 h-4 mr-2" />
                Call 988
              </Button>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                <ExternalLink className="w-4 h-4 mr-2" />
                Chat Online
              </Button>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Text HOME to 741741
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resource Categories */}
        <div className="space-y-12">
          {resources.map((category, categoryIndex) => {
            const CategoryIcon = category.icon;
            return (
              <div key={categoryIndex}>
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-therapy rounded-lg flex items-center justify-center mr-3">
                    <CategoryIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-calm-900 font-playfair">
                    {category.category}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <Card key={itemIndex} className="border-therapy-200 hover:border-therapy-300 transition-all duration-300 hover:shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg text-calm-800 flex items-start justify-between">
                          {item.title}
                          <Badge variant="outline" className="ml-2 text-xs">
                            {item.type}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-calm-600 leading-relaxed">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {item.contact && (
                          <div className="mb-4 p-3 bg-therapy-50 rounded-lg">
                            <p className="font-semibold text-therapy-700">{item.contact}</p>
                          </div>
                        )}
                        {item.action && (
                          <Button className="w-full bg-gradient-therapy hover:opacity-90">
                            {item.action}
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Support */}
        <Card className="mt-12 bg-gradient-therapy text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-playfair">
              Need More Personalized Support?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-therapy-100 mb-6">
              Our AI therapy companion is available 24/7 to provide personalized support and guidance tailored to your specific needs.
            </p>
            <Button className="bg-white text-therapy-600 hover:bg-therapy-50">
              Start a Session
              <Heart className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Resources;
