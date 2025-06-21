'use client'

import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

interface Slide {
  src: string
  alt: string
}

interface ImageCarouselProps {
  slides: Slide[]
  autoPlay?: boolean
}

export default function ImageCarousel({ slides, autoPlay = true }: ImageCarouselProps) {
  return (
    <Carousel
      showArrows
      showThumbs={false}
      infiniteLoop
      autoPlay={autoPlay}
      interval={5000}
      stopOnHover
      emulateTouch
      swipeable
      showStatus={false}
      className="rounded-lg shadow-2xl"
    >
      {slides.map((slide, idx) => (
        <div key={idx}>
          {/* Using regular <img> to keep react-responsive-carousel sizing simple */}
          <img src={slide.src} alt={slide.alt} className="object-cover w-full h-96" />
        </div>
      ))}
    </Carousel>
  )
} 