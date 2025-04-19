// js/carousels/moviesCarousel.js
import { getPopularMovies } from '../api/moviesApi.js';
import { createCarousel } from '../components/carousel.js';

export async function initCarouselMovies() {
  const movies = await getPopularMovies();
  createCarousel({
    containerId: 'carousel-section',
    items: movies,
    getTitle: (movie) => movie.title,
    getImage: (movie) =>
      movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
  });
}
