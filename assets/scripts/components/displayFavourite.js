import { toggleFavorite, updateStarUI } from './favourite.js';
import { createMovieCard } from '../api/moviesApi.js';
import { createSeriesCard } from '../api/seriesApi.js';

const API_KEY = '8c4b867188ee47a1d4e40854b27391ec'; // On reprend la même clé que celle utilisée dans les autres fichiers
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Récupère la liste des favoris depuis le localStorage
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}

// Récupère les détails d'un film par son ID
async function fetchMovieById(id) {
  try {
    const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=fr-FR`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    const data = await response.json();
    return {
      id: data.id,
      title: data.title,
      poster_path: data.poster_path,
      release_date: data.release_date,
      vote_average: data.vote_average
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération du film ${id}:`, error);
    return null;
  }
}

// Récupère les détails d'une série par son ID
async function fetchSeriesById(id) {
  try {
    const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=fr-FR`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    const data = await response.json();
    return {
      id: data.id,
      title: data.name, // Pour les séries c'est 'name' au lieu de 'title'
      poster_path: data.poster_path,
      release_date: data.first_air_date, // Pour les séries c'est 'first_air_date' au lieu de 'release_date'
      vote_average: data.vote_average
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération de la série ${id}:`, error);
    return null;
  }
}

// Crée une section pour un type spécifique de médias (films ou séries)
function createMediaSection(title) {
  const section = document.createElement('section');
  section.className = 'mt-8';

  const heading = document.createElement('h2');
  heading.className = 'text-2xl font-bold mb-4 px-6';
  heading.textContent = title;
  section.appendChild(heading);

  const container = document.createElement('div');
  container.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 place-items-center';
  section.appendChild(container);

  return { section, container };
}

// Initialise la page des favoris
export async function initializeFavoritesPage() {
  const main = document.getElementById('main');
  if (!main) return;

  main.innerHTML = '';

  // Ajouter un en-tête
  const header = document.createElement('div');
  header.className = 'text-white text-center pt-6 pb-4';
  header.innerHTML = '<h1 class="text-3xl font-bold">Mes Favoris</h1>';
  main.appendChild(header);

  // Récupérer les favoris
  const favorites = getFavorites();

  if (favorites.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'text-center text-gray-400 my-12';
    emptyMessage.innerHTML = `
      <svg class="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium">Aucun favori pour le moment</h3>
      <p class="mt-2">Explorez les films et séries et ajoutez-les à vos favoris pour les retrouver ici.</p>
      <div class="mt-6 flex justify-center gap-4">
        <a href="movies.html" class="bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded-lg">
          Explorer les films
        </a>
        <a href="series.html" class="bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded-lg">
          Explorer les séries
        </a>
      </div>
    `;
    main.appendChild(emptyMessage);
    return;
  }

  // Séparer les favoris par type
  const movieFavorites = favorites.filter(fav => fav.type === 'movie');
  const seriesFavorites = favorites.filter(fav => fav.type === 'tv');

  // Créer des sections pour les films et les séries
  let moviesSection, moviesContainer, seriesSection, seriesContainer;

  // Section des films favoris si nous en avons
  if (movieFavorites.length > 0) {
    const movieSection = createMediaSection('Films Favoris');
    moviesSection = movieSection.section;
    moviesContainer = movieSection.container;
    main.appendChild(moviesSection);
  }

  // Section des séries favorites si nous en avons
  if (seriesFavorites.length > 0) {
    const serieSection = createMediaSection('Séries Favorites');
    seriesSection = serieSection.section;
    seriesContainer = serieSection.container;
    main.appendChild(seriesSection);
  }

  // Chargement indicateur
  const loadingElement = document.createElement('div');
  loadingElement.className = 'text-center text-white my-8';
  loadingElement.textContent = 'Chargement de vos favoris...';
  main.appendChild(loadingElement);

  try {
    // Récupération des détails des films favoris
    const moviePromises = movieFavorites.map(async fav => {
      const movie = await fetchMovieById(fav.id);
      return movie;
    });

    // Récupération des détails des séries favorites
    const seriesPromises = seriesFavorites.map(async fav => {
      const series = await fetchSeriesById(fav.id);
      return series;
    });

    // Attendre que toutes les données soient récupérées
    const [movies, series] = await Promise.all([
      Promise.all(moviePromises),
      Promise.all(seriesPromises)
    ]);

    // Supprimer le chargement
    loadingElement.remove();

    // Afficher les films favoris
    if (movieFavorites.length > 0) {
      const validMovies = movies.filter(movie => movie !== null);
      
      if (validMovies.length === 0) {
        const noMoviesMsg = document.createElement('p');
        noMoviesMsg.className = 'text-gray-400 text-center';
        noMoviesMsg.textContent = 'Impossible de charger les films favoris.';
        moviesContainer.appendChild(noMoviesMsg);
      } else {
        validMovies.forEach(movie => {
          const movieCard = createMovieCard(movie);
          moviesContainer.appendChild(movieCard);
        });
      }
    }

    // Afficher les séries favorites
    if (seriesFavorites.length > 0) {
      const validSeries = series.filter(serie => serie !== null);
      
      if (validSeries.length === 0) {
        const noSeriesMsg = document.createElement('p');
        noSeriesMsg.className = 'text-gray-400 text-center';
        noSeriesMsg.textContent = 'Impossible de charger les séries favorites.';
        seriesContainer.appendChild(noSeriesMsg);
      } else {
        validSeries.forEach(serie => {
          // On adapte l'objet série pour qu'il soit compatible avec createSeriesCard
          const seriesData = {
            id: serie.id,
            name: serie.title,
            poster_path: serie.poster_path,
            first_air_date: serie.release_date,
            vote_average: serie.vote_average
          };
          const seriesCard = createSeriesCard(seriesData);
          seriesContainer.appendChild(seriesCard);
        });
      }
    }

    // Initialiser les boutons de favoris après chargement des cartes
    syncFavoritesOnPage();
  } catch (error) {
    console.error('Erreur lors du chargement des favoris:', error);
    loadingElement.textContent = `Une erreur est survenue lors du chargement des favoris: ${error.message}`;
  }
}

// Synchronise l'état des boutons favoris sur la page des favoris
function syncFavoritesOnPage() {
  const favorites = getFavorites();
  document.querySelectorAll('.star-container').forEach(container => {
    const id = container.dataset.id;
    const type = container.dataset.type;
    
    // Sur la page des favoris, tout devrait être déjà favori
    const isFavorite = favorites.some(f => f.id == id && f.type === type);
    updateStarUI(container, isFavorite);
    
    // Ajout d'un gestionnaire d'événements pour la suppression immédiate
    container.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log("Tentative de suppression du favori:", id, type);
  console.log("Avant suppression, localStorage:", JSON.parse(localStorage.getItem('favorites')));
  toggleFavorite(id, type);
  console.log("Après suppression, localStorage:", JSON.parse(localStorage.getItem('favorites')));
      
      // Basculer l'état favori
      toggleFavorite(id, type);
      
      // Supprimer l'élément parent (la carte) après un court délai
      setTimeout(() => {
        const cardElement = container.closest('.movie-card');
        if (cardElement) {
          cardElement.remove();
          
          // Vérifier si des sections sont vides après suppression
          checkEmptySections();
        }
      }, 300);
    });
  });
}

// Vérifie si des sections sont vides et les gère en conséquence
function checkEmptySections() {
  const movieContainer = document.querySelector('.movies-container');
  const seriesContainer = document.querySelector('.series-container');
  
  const favorites = getFavorites();
  
  // Si aucun favori restant, afficher un message et proposer d'explorer
  if (favorites.length === 0) {
    const main = document.getElementById('main');
    if (main) {
      main.innerHTML = '';
      
      const header = document.createElement('div');
      header.className = 'text-white text-center pt-6 pb-4';
      header.innerHTML = '<h1 class="text-3xl font-bold">Mes Favoris</h1>';
      main.appendChild(header);
      
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'text-center text-gray-400 my-12';
      emptyMessage.innerHTML = `
        <svg class="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium">Tous les favoris ont été supprimés</h3>
        <p class="mt-2">Explorez les films et séries et ajoutez-les à vos favoris pour les retrouver ici.</p>
        <div class="mt-6 flex justify-center gap-4">
          <a href="movies.html" class="bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded-lg">
            Explorer les films
          </a>
          <a href="series.html" class="bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded-lg">
            Explorer les séries
          </a>
        </div>
      `;
      main.appendChild(emptyMessage);
    }
  }
}