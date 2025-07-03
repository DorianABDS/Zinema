import { getPopularMovies } from '../api/moviesApi.js';
import { createCarousel } from '../components/carousel.js';

export async function initCarouselMovies() {
  const movies = await getPopularMovies();

  createCarousel({
    containerId: 'carousel-section',
    items: movies,                    
    
    getTitle: (movie) => movie.title,

    getImage: (movie) => 
      movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/assets/images/no-poster.jpg',
      
    carouselTitle: "Films populaires"
  });

  const carouselItems = document.querySelectorAll('#carousel-section > div');
  carouselItems.forEach((item, index) => {
    const movie = movies[index];
    const link = document.createElement('a');
    link.href = `../pages/details.html?id=${movie.id}&type=movie`;

    while (item.firstChild) {
      link.appendChild(item.firstChild);
    }
    
    item.appendChild(link);
  });
}