import { getPopularMovies } from '../api/moviesApi.js';
import { createCarousel } from '../components/carousel.js';

/**
 * Initialise le carousel pour afficher les films populaires
 * Récupère les données depuis l'API et configure le carousel
 */
export async function initCarouselMovies() {
  // Récupération des films populaires depuis l'API
  const movies = await getPopularMovies();
  
  // Configuration et création du carousel
  createCarousel({
    containerId: 'carousel-section',         // ID unique pour ce carousel
    items: movies,                           // Données des films à afficher
    
    // Fonction pour extraire le titre de chaque film
    getTitle: (movie) => movie.title,
    
    // Fonction pour obtenir l'URL de l'image
    // Utilise une image par défaut si aucune affiche n'est disponible
    getImage: (movie) => 
      movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/assets/images/no-poster.jpg',
  });
}