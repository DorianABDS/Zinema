// js/carousels/seriesCarousel.js
import { getPopularSeries } from '../api/seriesApi.js';
import { createCarousel } from '../components/carousel.js';

export async function initCarouselSeries() {
  const series = await getPopularSeries();
  createCarousel({
    containerId: 'series-carousel-section',
    items: series,
    getTitle: (serie) => serie.name,
    getImage: (serie) =>
      serie.poster_path
        ? `https://image.tmdb.org/t/p/w500${serie.poster_path}`
        : null,
  });
}
