import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  content: string;
  photoUrl?: string;
  isActive: boolean;
}

interface TestimonialsPreviewProps {
  data?: {
    testimonials: Testimonial[];
  };
}

const TestimonialsPreview: React.FC<TestimonialsPreviewProps> = ({ data }) => {
  if (!data || !data.testimonials || data.testimonials.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Aucun témoignage à afficher.
      </div>
    );
  }

  const activeTestimonials = data.testimonials.filter(t => t.isActive);

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Ce que disent mes clients</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTestimonials.map((testimonial) => (
          <Card key={testimonial.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {testimonial.photoUrl ? (
                  <img
                    src={testimonial.photoUrl}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <span className="text-gray-500 font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">
                    {testimonial.position}, {testimonial.company}
                  </p>
                </div>
              </div>
              <p className="italic text-gray-700">"{testimonial.content}"</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsPreview;