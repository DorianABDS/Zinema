const API_KEY = '8c4b867188ee47a1d4e40854b27391ec'; // Clé API TMDB
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

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
