import { getPopularSeries } from '../api/seriesApi.js';
import { createCarousel } from '../components/carousel.js';

/**
 * Initialise le carousel pour afficher les séries populaires
 * Récupère les données depuis l'API et configure le carousel
 */
export async function initCarouselSeries() {
  // Récupération des séries populaires depuis l'API
  const series = await getPopularSeries();
  
  // Configuration et création du carousel
  createCarousel({
    containerId: 'series-carousel-section',  // ID unique pour ce carousel
    items: series,                           // Données des séries à afficher
    
    // Fonction pour extraire le titre de chaque série
    getTitle: (serie) => serie.name,
    
    // Fonction pour obtenir l'URL de l'image
    // Utilise une image par défaut si aucune affiche n'est disponible
    getImage: (serie) =>
      serie.poster_path ? `https://image.tmdb.org/t/p/w500${serie.poster_path}` : '/assets/images/no-poster.jpg',
  });
}