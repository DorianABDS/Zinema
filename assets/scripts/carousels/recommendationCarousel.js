// Maintenant, créons un nouveau fichier: carousels/recommendationsCarousel.js
import { createCarousel } from '../components/carousel.js';
import { fetchMovieRecommendations, fetchSeriesRecommendations } from '../api/recommendationsApi.js';

export async function initCarouselRecommendations(mediaId, mediaType, mediaTitle) {
  try {
    // Récupérer les recommandations en fonction du type (film ou série)
    const recommendations = mediaType === 'movie' 
      ? await fetchMovieRecommendations(mediaId)
      : await fetchSeriesRecommendations(mediaId);
    
    if (recommendations && recommendations.length > 0) {
      // Créer le carrousel de recommandations
      createCarousel({
        containerId: 'recommendationsCarousel',
        items: recommendations,
        getTitle: item => item.title || item.name,
        getImage: item => {
          if (item.poster_path) {
            return `https://image.tmdb.org/t/p/w300${item.poster_path}`;
          }
          return '/images/no-image.png'; // Image par défaut si pas de poster
        }
      });
      
      // Modifier le titre du carrousel pour indiquer qu'il s'agit de recommandations
      const carouselTitle = document.querySelector('.carousel-section h2');
      if (carouselTitle) {
        carouselTitle.textContent = mediaType === 'movie' 
          ? `Films similaires à "${mediaTitle}"`
          : `Séries similaires à "${mediaTitle}"`;
      }
      
      // Ajouter des liens sur les éléments du carrousel
      const carouselItems = document.querySelectorAll('#recommendationsCarousel > div');
      carouselItems.forEach((item, index) => {
        const recommendation = recommendations[index];
        const link = document.createElement('a');
        link.href = `details.html?id=${recommendation.id}&type=${mediaType}`;
        
        // Déplacer le contenu de l'élément dans le lien
        while (item.firstChild) {
          link.appendChild(item.firstChild);
        }
        
        item.appendChild(link);
      });
      
      return true;
    } else {
      console.log('Aucune recommandation trouvée');
      return false;
    }
  } catch (error) {
    console.error('Erreur lors du chargement du carrousel de recommandations:', error);
    return false;
  }
}

// Enfin, modifions la fonction init dans main.js pour utiliser notre nouveau carrousel