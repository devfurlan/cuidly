'use client';

import { useState } from 'react';
import { PiCaretLeft, PiCaretRight, PiStarFill } from 'react-icons/pi';

export default function Testimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Família',
      text: 'Encontrei a babá perfeita em 2 dias! O sistema de verificação me deu muita segurança.',
      rating: 5,
      avatar: 'MS',
    },
    {
      name: 'Pedro Oliveira',
      role: 'Família',
      text: 'As avaliações de outras famílias me ajudaram muito na escolha. Recomendo!',
      rating: 5,
      avatar: 'PO',
    },
    {
      name: 'Juliana Santos',
      role: 'Família',
      text: 'O matching inteligente me ajudou a encontrar uma babá perfeita para meu bebê. Super recomendo!',
      rating: 5,
      avatar: 'JS',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(testimonials[(currentSlide + i) % testimonials.length]);
    }
    return visible;
  };

  return (
    <section className="bg-linear-to-b from-fuchsia-50 to-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            O que dizem sobre nós
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Depoimentos reais de famílias que confiam na Cuidly
          </p>
        </div>

        <div className="relative">
          <div className="grid gap-8 md:grid-cols-3">
            {getVisibleTestimonials().map((testimonial, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <PiStarFill key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-gray-700">
                  {`"${testimonial.text}"`}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 to-blue-500 font-semibold text-white">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-0 flex hidden h-10 w-10 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-gray-50 md:flex"
          >
            <PiCaretLeft className="h-6 w-6 text-gray-700" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-0 flex hidden h-10 w-10 translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-gray-50 md:flex"
          >
            <PiCaretRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-2 md:hidden">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-fuchsia-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
