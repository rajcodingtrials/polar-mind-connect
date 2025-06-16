
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Graduate Student",
    content: "Polariz helped me through my anxiety during finals week. Having someone to talk to at 2 AM made all the difference.",
    rating: 5,
    initial: "SC"
  },
  {
    name: "Michael Rodriguez",
    role: "Software Engineer",
    content: "The privacy and accessibility of this platform is incredible. I can work through my thoughts without judgment.",
    rating: 5,
    initial: "MR"
  },
  {
    name: "Emily Watson",
    role: "Healthcare Worker",
    content: "As a nurse, I appreciate evidence-based approaches. Polariz provides real therapeutic value with genuine empathy.",
    rating: 5,
    initial: "EW"
  },
  {
    name: "David Kim",
    role: "Business Owner",
    content: "The 24/7 availability has been a game-changer for managing work stress. Highly recommend for busy professionals.",
    rating: 5,
    initial: "DK"
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-calm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-calm-900 mb-6 font-playfair">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-calm-600 max-w-3xl mx-auto">
            Real stories from people who found support and healing through our platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white border-therapy-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-calm-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallback className="bg-therapy-100 text-therapy-700 font-semibold">
                      {testimonial.initial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-calm-800">{testimonial.name}</p>
                    <p className="text-sm text-calm-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
