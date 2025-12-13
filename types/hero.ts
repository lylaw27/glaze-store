// Hero Carousel Types

export interface HeroSlide {
  id?: number;
  image: string;
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface HeroCarouselProps {
  slides: HeroSlide[];
}
