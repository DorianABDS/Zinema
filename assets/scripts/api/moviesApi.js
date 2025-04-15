const API_KEY = '8c4b867188ee47a1d4e40854b27391ec'; // Remplacez par votre vraie clé API TMDB
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Fonction pour récupérer les films populaires
export async function getAllPopularMovies(pages = 1) {
  let allMovies = [];
  
  try {
    for (let page = 1; page <= pages; page++) {
      console.log(`Récupération de la page ${page} des films populaires...`);
      const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        console.log(`${data.results.length} films trouvés à la page ${page}`);
        allMovies = [...allMovies, ...data.results];
      } else {
        console.log('Aucun résultat trouvé pour cette page');
      }
    }
    
    return allMovies;
  } catch (error) {
    console.error('Erreur lors de la récupération des films:', error);
    throw error;
  }
}

// Fonction pour afficher les images des films
export async function displayMovieImages() {
  try {
    console.log('Démarrage de displayMovieImages()');
    const main = document.getElementById('main');
    
    if (!main) {
      console.error('Élément #main non trouvé dans le document');
      return;
    }
    
    // Supprime le loader s'il existe
    const loader = main.querySelector('.animate-spin')?.parentNode;
    if (loader) {
      main.removeChild(loader);
    }
    
    const movies = await getAllPopularMovies(2);
    console.log(`${movies.length} films récupérés au total`);
    
    if (movies.length === 0) {
      main.innerHTML = '<div class="text-white text-center p-10">Aucun film trouvé</div>';
      return;
    }
    
    // Crée un conteneur flex pour les affiches de films
    const container = document.createElement('div');
    container.className = 'flex flex-wrap justify-center gap-6 p-6';
    
    movies.forEach(movie => {
      if (movie.poster_path) {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card relative w-48 mb-6 cursor-pointer transition-all duration-300 hover:scale-105';
        
        const img = document.createElement('img');
        img.src = `${IMAGE_BASE_URL}${movie.poster_path}`;
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
        
        movieCard.appendChild(img);
        movieCard.appendChild(title);
        container.appendChild(movieCard);
      }
    });
    
    main.appendChild(container);
    console.log('Affichage des films terminé');
  } catch (error) {
    console.error('Erreur dans displayMovieImages:', error);
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