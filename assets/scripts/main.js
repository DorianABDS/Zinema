//  Imports 
import { fetchMoviesPage, createMovieCard, initializeMoviesPage } from './api/moviesApi.js';
import { fetchSeriesPage, createSeriesCard, initializeSeriesPage } from './api/seriesApi.js';
import { createPagination } from './components/pagination.js';
import { initSearch } from './components/search.js';
import { fetchAutocompleteResults } from './components/search.js';
import { fetchSeriesDetails, fetchMovieDetails } from './api/detailsApi.js';

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
    initSearch(); // Initialiser la recherche
    fetchAutocompleteResults(query)
  }
  // ----- Page SERIES -----
  else if (currentPage.includes('series.html')) {
    console.log('Page Séries détectée, chargement des séries...');
    loadContent('series', 1); // Idem pour les séries
    initSearch(); // Initialiser la recherche
    fetchAutocompleteResults(query)
  
  }
  
  // ----- Page DETAILS -----
  else if (currentPage.includes('details.html')) {
    console.log('Page Détails détectée');
    initSearch(); // Initialiser la recherche
  
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type');
  
    if (id && type === 'movie') {
      try {
        const movie = await fetchMovieDetails(id);
        renderDetails(movie);
      } catch (error) {
        console.error('Erreur lors du chargement des détails du film :', error);
      }
    }
  
    else if (id && type === 'tv') {
      try {
        const serie = await fetchSeriesDetails(id);
        renderDetails(serie);
      } catch (error) {
        console.error('Erreur lors du chargement des détails de la série :', error);
      }
    }
  }
  
  // ----- Page FAVORIS (à compléter) -----
  else if (currentPage.includes('favorites.html')) {
    console.log('Page Favoris chargée');
    initSearch(); // Initialiser la recherche
    // Ajouter la logique favoris ici
  }
  
  // ----- Menu mobile -----
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('overlay');
  
  function toggleMenu() {
    mobileMenu?.classList.toggle('translate-x-full');
    overlay?.classList.toggle('hidden');
  }
  burger?.addEventListener('click', toggleMenu);
  overlay?.addEventListener('click', toggleMenu);
}

//  Attendre que le DOM soit prêt pour initialiser l'app
document.addEventListener('DOMContentLoaded', init);





// ----- Fonction d'affichage commune (films + séries) -----
function renderDetails(media) {
  const main = document.getElementById('main');
  if (!main) return;

  const container = document.createElement('div');
  container.className = 'max-w-4xl mx-auto mt-10 bg-gray-800 rounded-xl p-6 text-white shadow-lg';
  container.style.position = 'relative';

  // Création d'un conteneur flex pour le titre et l'étoile
  const headerContainer = document.createElement('div');
  headerContainer.className = 'flex justify-between items-center mb-4';
  
  const title = document.createElement('h2');
  title.className = 'text-3xl font-bold';
  title.textContent = media.titre;
  headerContainer.appendChild(title);

  // Conteneur pour les deux états de l'étoile (normal et favori)
  const starContainer = document.createElement('div');
  starContainer.className = 'relative w-6 h-6';
  
  // Étoile normale (contour blanc)
  const starNormal = document.createElement('img');
  starNormal.src = 'https://cdn-icons-png.flaticon.com/512/13/13595.png';
  starNormal.alt = 'Étoile';
  starNormal.className = 'w-6 h-6 absolute top-0 left-0';
  starNormal.style.filter = 'invert(1)';
  starNormal.style.display = 'block'; // Cachée par défaut
  starNormal.dataset.state = 'normal';
  starContainer.appendChild(starNormal);
  
  // Étoile jaune (pour l'état favori) - initialement cachée
  const starFavorite = document.createElement('img');
  starFavorite.src = 'https://cdn-icons-png.flaticon.com/512/13/13595.png';
  starFavorite.alt = 'Étoile favorite';
  starFavorite.className = 'w-6 h-6 absolute top-0 left-0';
  starFavorite.style.filter = 'invert(0.9) sepia(1) saturate(10) hue-rotate(0deg) brightness(1.2)';
  starFavorite.style.display = 'none'; // Cachée par défaut
  starFavorite.dataset.state = 'favorite';
  starContainer.appendChild(starFavorite);
  
  headerContainer.appendChild(starContainer);
  container.appendChild(headerContainer);

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'flex flex-col md:flex-row gap-6';

  const poster = document.createElement('img');
  poster.src = media.affiche;
  poster.alt = `Affiche de ${media.titre}`;
  poster.className = 'rounded-lg w-full md:w-1/3';
  contentWrapper.appendChild(poster);

  const details = document.createElement('div');
  details.className = 'flex-1';

  const date = document.createElement('p');
  date.className = 'text-sm text-gray-400';
  date.textContent = `Date de sortie : ${media.date_sortie}`;
  details.appendChild(date);

  const note = document.createElement('p');
  note.className = 'text-sm text-yellow-400';
  note.textContent = `Note moyenne : ${media.note}/10`;
  details.appendChild(note);

  const genres = document.createElement('p');
  genres.className = 'text-sm text-gray-300 mb-4';
  genres.textContent = `Genres : ${media.genres.join(', ')}`;
  details.appendChild(genres);

  const overview = document.createElement('p');
  overview.className = 'mb-4';
  overview.textContent = media.resume;
  details.appendChild(overview);

  const actorsTitle = document.createElement('h3');
  actorsTitle.className = 'text-xl font-semibold mt-4 mb-2';
  actorsTitle.textContent = 'Acteurs principaux :';
  details.appendChild(actorsTitle);

  const actorList = document.createElement('div');
  actorList.className = 'grid grid-cols-2 gap-4';

  media.acteurs.forEach(acteur => {
    const card = document.createElement('div');
    card.className = 'flex items-center gap-3';

    if (acteur.photo) {
      const img = document.createElement('img');
      img.src = acteur.photo;
      img.alt = acteur.nom;
      img.className = 'w-12 h-12 rounded-full object-cover';
      card.appendChild(img);
    }

    const infos = document.createElement('div');
    const nom = document.createElement('p');
    nom.className = 'font-semibold';
    nom.textContent = acteur.nom;

    const role = document.createElement('p');
    role.className = 'text-sm text-gray-400';
    role.textContent = `Rôle : ${acteur.personnage}`;

    infos.appendChild(nom);
    infos.appendChild(role);
    card.appendChild(infos);

    actorList.appendChild(card);
  });

  details.appendChild(actorList);
  contentWrapper.appendChild(details);
  container.appendChild(contentWrapper);
  main.appendChild(container);
}