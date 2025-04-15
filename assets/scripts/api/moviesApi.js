const API_KEY = '8c4b867188ee47a1d4e40854b27391ec'; // Remplacez par votre vraie clé API TMDB
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Variables pour la pagination et le scroll infini
let currentPage = 1;
let isLoading = false;
let hasMoreMovies = true;

// Fonction pour récupérer une page de films populaires
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
      // Vérifier si on a atteint la dernière page
      if (page >= data.total_pages) {
        hasMoreMovies = false;
      }
      return data.results;
    } else {
      console.log('Aucun résultat trouvé pour cette page');
      hasMoreMovies = false;
      return [];
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des films:', error);
    throw error;
  }
}

// Fonction pour créer une carte de film
function createMovieCard(movie) {
  const movieCard = document.createElement('div');
  movieCard.className = 'movie-card relative w-48 mb-6 cursor-pointer transition-all duration-300 hover:scale-105';
  
  const img = document.createElement('img');
  img.src = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : '/assets/images/no-poster.jpg';
  img.alt = movie.title;
  img.className = 'w-full rounded-lg shadow-lg';
  img.dataset.movieId = movie.id;
  
  // Ajoute un événement de clic pour rediriger vers la page de détails
  movieCard.addEventListener('click', () => {
    window.location.href = `details.html?id=${movie.id}&type=movie`;
  });
  
  const title = document.createElement('p');
  title.textContent = movie.title;
  title.className = 'text-white text-center mt-2 font-medium';
  
  // Ajouter la date de sortie
  const releaseDate = document.createElement('p');
  releaseDate.textContent = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  releaseDate.className = 'text-gray-400 text-center text-sm';
  
  // Ajouter la note
  if (movie.vote_average) {
    const rating = document.createElement('div');
    rating.className = 'absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-full text-sm';
    rating.textContent = movie.vote_average.toFixed(1);
    movieCard.appendChild(rating);
  }
  
  movieCard.appendChild(img);
  movieCard.appendChild(title);
  movieCard.appendChild(releaseDate);
  
  return movieCard;
}

// Fonction pour charger plus de films (utilisée lors du scroll)
export async function loadMoreMovies() {
  if (isLoading || !hasMoreMovies) return;
  
  try {
    isLoading = true;
    
    // Ajouter un indicateur de chargement
    const main = document.getElementById('main');
    const container = document.querySelector('.movies-container') || createMoviesContainer();
    
    const loader = document.createElement('div');
    loader.className = 'loading-indicator flex justify-center items-center p-4 w-full';
    loader.innerHTML = '<div class="animate-spin rounded-full h-8 w-8 border-4 border-red-700 border-t-transparent"></div>';
    container.appendChild(loader);
    
    // Charger la page suivante
    currentPage++;
    const movies = await getPopularMovies(currentPage);
    
    // Supprimer l'indicateur de chargement
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
    
    // Ajouter les nouveaux films
    if (movies.length > 0) {
      movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        container.appendChild(movieCard);
      });
    }
    
    isLoading = false;
    
    // Si on n'a plus de films, afficher un message
    if (!hasMoreMovies) {
      const endMessage = document.createElement('div');
      endMessage.className = 'text-white text-center p-4 w-full';
      endMessage.textContent = "Vous avez atteint la fin de la liste des films populaires.";
      container.appendChild(endMessage);
    }
  } catch (error) {
    console.error('Erreur lors du chargement de plus de films:', error);
    isLoading = false;
  }
}

// Créer le conteneur de films initial
function createMoviesContainer() {
  const main = document.getElementById('main');
  const container = document.createElement('div');
  container.className = 'movies-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-6 place-items-center';
  main.appendChild(container);
  return container;
}

// Initialiser la page de films avec chargement infini
export async function initializeMoviesPage() {
  try {
    console.log('Initialisation de la page de films...');
    const main = document.getElementById('main');
    
    if (!main) {
      console.error('Élément #main non trouvé dans le document');
      return;
    }
    
    // Vider le contenu existant
    main.innerHTML = '';
    
    // Ajouter un titre
    const header = document.createElement('div');
    header.className = 'text-white text-center pt-6 pb-4';
    header.innerHTML = '<h1 class="text-3xl font-bold">Films Populaires</h1>';
    main.appendChild(header);
    
    // Créer le conteneur pour les films
    const container = createMoviesContainer();
    
    // Charger la première page
    const initialMovies = await getPopularMovies(currentPage);
    
    if (initialMovies.length === 0) {
      container.innerHTML = '<div class="text-white text-center p-10">Aucun film trouvé</div>';
      return;
    }
    
    // Ajouter les films à la page
    initialMovies.forEach(movie => {
      const movieCard = createMovieCard(movie);
      container.appendChild(movieCard);
    });
    
    // Ajouter un écouteur d'événement pour le défilement
    window.addEventListener('scroll', () => {
      // Vérifier si on est proche du bas de la page
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMoreMovies();
      }
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