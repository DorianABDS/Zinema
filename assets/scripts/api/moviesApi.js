const API_KEY = '8c4b867188ee47a1d4e40854b27391ec'; // Clé API TMDB
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
import { toggleFavorite, updateStarUI } from '../components/favourite.js';

let currentPage = 1;

// === Récupérer une page complète de films populaires ===
export async function getPopularMovies(page = 1) {
  try {
    console.log(`Récupération de la page ${page} des films populaires...`);
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      console.log(`${data.results.length} films trouvés à la page ${page}`);
      return data.results;
    } else {
      console.log('Aucun résultat trouvé pour cette page');
      return [];
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des films:', error);
    throw error;
  }
}

// === Version alternative avec 12 films + totalResults (utile pour pagination manuelle) ===
export async function fetchMoviesPage(page = 1) {
  try {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    const data = await response.json();
    return {
      results: data.results.slice(0, 12),
      totalResults: data.total_results
    };
  } catch (error) {
    console.error('Erreur films:', error);
    throw error;
  }
}

// === Créer une carte de film ===
export function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card relative w-48 mb-6 cursor-pointer transition-all duration-300 hover:scale-105';
  
  const img = document.createElement('img');
  img.src = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : '/assets/images/no-poster.jpg';
  img.alt = movie.title;
  img.className = 'w-full rounded-lg shadow-lg';
  img.dataset.movieId = movie.id;

  card.addEventListener('click', () => {
    window.location.href = `details.html?id=${movie.id}&type=movie`;
  });

  const title = document.createElement('p');
  title.textContent = movie.title;
  title.className = 'text-white text-center mt-2 font-medium';

  const date = document.createElement('p');
  date.textContent = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  date.className = 'text-gray-400 text-center text-sm';

  if (movie.vote_average) {
    const rating = document.createElement('span');
    rating.className = 'absolute top-2 right-2 px-2 py-1 rounded-full text-sm ring-1 ring-inset ring-yellow-600/50 dark:bg-black/60 dark:text-yellow-300 dark:ring-yellow-300/20';
    rating.textContent = movie.vote_average.toFixed(1);
    card.appendChild(rating);
  }

  // Crée le bouton étoile - CORRIGÉ
  const starButton = document.createElement('button');
  starButton.type = 'button';
  starButton.className = 'star-container absolute top-2 left-2 bg-black/60 rounded-full w-7 h-7 flex items-center justify-center z-10 ring-1 ring-inset ring-yellow-600/50 focus:outline-none';
  starButton.dataset.id = movie.id;    // Corriger pour mettre les attributs data sur le bouton
  starButton.dataset.type = 'movie';   // Corriger pour mettre les attributs data sur le bouton
  starButton.setAttribute('aria-label', 'Ajouter ou retirer des favoris');

  // SVG étoile vide (blanche)
  const starEmpty = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  starEmpty.setAttribute('viewBox', '0 0 24 24');
  starEmpty.setAttribute('fill', 'none');
  starEmpty.setAttribute('stroke', 'white');
  starEmpty.setAttribute('stroke-width', '2');
  starEmpty.setAttribute('class', 'w-4 h-4 absolute pointer-events-none');
  starEmpty.dataset.state = 'normal';
  starEmpty.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>`;

  // SVG étoile pleine (jaune)
  const starFull = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  starFull.setAttribute('viewBox', '0 0 24 24');
  starFull.setAttribute('fill', '#FFD600');
  starFull.setAttribute('class', 'w-4 h-4 absolute pointer-events-none');
  starFull.style.display = 'none';
  starFull.dataset.state = 'favorite';
  starFull.innerHTML = `<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>`;

  starButton.appendChild(starEmpty);
  starButton.appendChild(starFull);

  starButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = starButton.dataset.id;
    const type = starButton.dataset.type;
    const isFavorite = toggleFavorite(id, type);
    updateStarUI(starButton, isFavorite);
  });

  card.appendChild(starButton);

  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(date);

  return card;
}

// === Créer le conteneur de films ===
function createMoviesContainer() {
  const main = document.getElementById('main');
  const container = document.createElement('div');
  container.className = 'movies-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-6 place-items-center';
  main.appendChild(container);
  return container;
}

// === Initialiser la page de films sans scroll infini ===
export async function initializeMoviesPage() {
  try {
    console.log('Initialisation de la page de films...');
    const main = document.getElementById('main');
    
    if (!main) {
      console.error('Élément #main non trouvé dans le document');
      return;
    }
    
    main.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'text-white text-center pt-6 pb-4';
    header.innerHTML = '<h1 class="text-3xl font-bold">Films Populaires</h1>';
    main.appendChild(header);
    
    const container = createMoviesContainer();
    
    const initialMovies = await getPopularMovies(currentPage);
    
    if (initialMovies.length === 0) {
      container.innerHTML = '<div class="text-white text-center p-10">Aucun film trouvé</div>';
      return;
    }

    initialMovies.forEach(movie => {
      const movieCard = createMovieCard(movie);
      container.appendChild(movieCard);
    });

    console.log('Page de films initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la page de films:', error);
    const main = document.getElementById('main');
    if (main) {
      main.innerHTML = `
        <div class="text-center text-white p-10">
          <h2 class="text-2xl">Erreur de chargement</h2>
          <p class="mt-4">Impossible de charger les films: ${error.message}</p>
        </div>
      `;
    }
  }
}
