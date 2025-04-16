//  Imports 
import { fetchMoviesPage, createMovieCard, initializeMoviesPage } from './api/moviesApi.js';
import { fetchSeriesPage, createSeriesCard, initializeSeriesPage } from './api/seriesApi.js';
import { createPagination } from './components/pagination.js';

async function loadContent(type, page) {
  const main = document.getElementById('main');
  main.innerHTML = '<div class="text-white p-4">Chargement...</div>';

  try {
    const fetchFn = type === 'movie' ? fetchMoviesPage : fetchSeriesPage;
    const createCardFn = type === 'movie' ? createMovieCard : createSeriesCard;
    
    const { results, totalResults } = await fetchFn(page);
    const totalPages = Math.min(Math.ceil(totalResults / 12), 500);

    const container = document.createElement('div');
    container.className = 'movies-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-6 place-items-center';
    results.forEach(item => container.appendChild(createCardFn(item)));

    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination flex justify-center pb-6';
    
    main.innerHTML = '';
    main.appendChild(container);
    main.appendChild(paginationContainer);

    createPagination({
      container: paginationContainer,
      currentPage: page,
      totalPages,
      onPageChange: (newPage) => loadContent(type, newPage)
    });

  } catch (error) {
    main.innerHTML = `<div class="text-red-500 p-4">Erreur : ${error.message}</div>`;
  }
}

// Fonction d'initialisation principale
async function init() {
  const currentPage = window.location.pathname;
  console.log('Main.js chargé. Page actuelle:', currentPage);

  if (currentPage.includes('movies.html')) {
    console.log('Page Films détectée, chargement des films...');
    loadContent('movie', 1); //  On utilise la version avec pagination
  }
  else if (currentPage.includes('series.html')) {
    console.log('Page Séries détectée, chargement des séries...');
    loadContent('series', 1); // Idem pour les séries
  }
  else if (currentPage.includes('details.html')) {
    console.log('Page Détails chargée');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type');
    if (id && type) {
      console.log(`Affichage des détails de ${type} avec l'ID: ${id}`);
    }
  }
  else if (currentPage.includes('favorites.html')) {
    console.log('Page Favoris chargée');
    // Ajouter le code pour afficher les favoris ici
  }
  else {
    console.log('Page d\'accueil chargée');
    // Code spécifique à la page d'accueil si nécessaire
  }
}

//  Attendre que le DOM soit prêt pour initialiser l'app
document.addEventListener('DOMContentLoaded', init);

//  Gestion du menu responsive
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('overlay');

  function toggleMenu() {
    mobileMenu.classList.toggle('translate-x-full');
    overlay.classList.toggle('hidden');
  }

  burger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);
});
