import { createMovieCard } from '../api/moviesApi.js';
import { createSeriesCard } from '../api/seriesApi.js';
import { fetchMovieDetails } from '../api/detailsApi.js';
import { fetchSeriesDetails } from '../api/detailsApi.js';

export function initializeFavoritesPage() {
  const main = document.getElementById('main');
  if (!main || !window.location.pathname.includes('favorites.html')) return;

  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  console.log('Favoris dans le localStorage:', favorites);

  if (favorites.length === 0) {
    main.innerHTML = '<p class="text-white text-center py-8">Aucun favori pour le moment</p>';
    return;
  }

  const container = document.createElement('div');
  container.className = 'movies-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-6 place-items-center';

  favorites.forEach(async (fav) => {
    try {
      let card;
      if (fav.type === 'movie') {
        const movie = await fetchMovieDetails(fav.id);
        card = createMovieCard(movie);
      } else if (fav.type === 'tv') {
        const serie = await fetchSeriesDetails(fav.id);
        card = createSeriesCard(serie);
      }
      
      // Force l'étoile à être remplie
      const starFill = card.querySelector('[data-state="favorite"]');
      const starEmpty = card.querySelector('[data-state="normal"]');
      if (starFill && starEmpty) {
        starEmpty.style.display = 'none';
        starFill.style.display = 'block';
      }
      
      container.appendChild(card);
    } catch (error) {
      console.error('Erreur avec le favori', fav.id, error);
    }
  });

  main.appendChild(container);
}
