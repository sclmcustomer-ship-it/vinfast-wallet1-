'use client';

import { useState, useEffect } from 'react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Xe Điện Thông Minh',
    subtitle: 'PHONG CÁCH - HIỆN ĐẠI',
    description: 'Trải nghiệm công nghệ xe điện tiên tiến với thiết kế đẳng cấp',
    image: '/images/hero-1.jpg',
    ctaText: 'Khám Phá Ngay',
    ctaLink: '/products',
  },
  {
    id: 2,
    title: 'Tiết Kiệm - Thân Thiện',
    subtitle: 'XE ĐIỆN TƯƠNG LAI',
    description: 'Giải pháp di chuyển xanh, bảo vệ môi trường',
    image: '/images/hero-2.jpg',
    ctaText: 'Xem Sản Phẩm',
    ctaLink: '/products',
  },
  {
    id: 3,
    title: 'Công Nghệ Vượt Trội',
    subtitle: 'ĐỘ BỀN CAO',
    description: 'Pin lithium thế hệ mới, quãng đường di chuyển xa',
    image: '/images/hero-3.jpg',
    ctaText: 'Tìm Hiểu Thêm',
    ctaLink: '/technology',
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-gray-900">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <div className="relative w-full h-full bg-gradient-to-r from-blue-600 to-purple-600">
              {/* Placeholder for image - replace with actual images */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white/20 text-6xl font-bold">
                  {slide.title}
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-center h-full text-white max-w-2xl">
              <div className="space-y-4 md:space-y-6">
                <p className="text-sm md:text-base font-semibold tracking-wider uppercase text-yellow-400">
                  {slide.subtitle}
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-200">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <a
                    href={slide.ctaLink}
                    className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
                  >
                    {slide.ctaText}
                    <svg
                      className="ml-2 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-lg transition-colors duration-300 border-2 border-white/50"
                  >
                    Liên Hệ Tư Vấn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full transition-colors duration-300 z-10"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full transition-colors duration-300 z-10"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
