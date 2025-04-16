// Import des fonctions nécessaires depuis les API
import { getPopularMovies } from '../api/moviesApi.js';
import { getPopularSeries } from '../api/seriesApi.js';

// Ajustement des sélecteurs pour correspondre à la structure HTML
let searchInput = document.getElementById('search_input'); // Changé pour correspondre à l'ID dans le HTML
const resultsContainer = document.createElement('div'); // Création d'un conteneur pour les résultats
resultsContainer.id = 'results-container';
resultsContainer.classList.add('absolute', 'bg-gray-800', 'rounded', 'mt-1', 'w-full', 'z-10', 'top-full', 'left-0', 'max-h-96', 'overflow-y-auto');

// Fonction pour afficher les résultats de l'autocomplétion
function displayResults(results) {
  resultsContainer.innerHTML = ''; // Effacer les résultats précédents

  if (results.length === 0) {
    const noResults = document.createElement('div');
    noResults.classList.add('p-3', 'text-white', 'text-center');
    noResults.textContent = 'Aucun résultat trouvé';
    resultsContainer.appendChild(noResults);
    return;
  }

  results.forEach(result => {
    const resultItem = document.createElement('div');
    resultItem.classList.add('result-item', 'p-2', 'hover:bg-gray-700', 'cursor-pointer', 'text-white');
    
    // Déterminer si c'est un film ou une série
    const type = result.title ? 'movie' : 'tv';
    const title = result.title || result.name;
    
    resultItem.textContent = title;
    
    // Ajouter un événement de clic pour naviguer vers la page de détails
    resultItem.addEventListener('click', () => {
      window.location.href = `details.html?id=${result.id}&type=${type}`;
    });
    
    resultsContainer.appendChild(resultItem);
  });
}

// Fonction de recherche avec autocomplétion
export function handleSearch() {
  // Vérifiez que searchInput existe et a une valeur
  if (!searchInput || !searchInput.value) {
    console.error("searchInput n'est pas défini ou n'a pas de valeur");
    return;
  }
  
  const query = searchInput.value.trim();

  if (query.length >= 1) { // Lance la recherche après 1 caractère
    fetchAutocompleteResults(query);
  } else {
    resultsContainer.innerHTML = ''; // Effacer si moins de 1 caractère
  }
}

// Fonction pour récupérer les résultats de l'API d'autocomplétion
export async function fetchAutocompleteResults(query) {
  try {
    // Utiliser l'API TMDB pour rechercher des films et des séries
    const API_KEY = '8c4b867188ee47a1d4e40854b27391ec'; // Utilisation de la même clé API que dans moviesApi.js
    const BASE_URL = 'https://api.themoviedb.org/3';
    
    // Recherche de films
    const movieResponse = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=fr-FR&query=${query}&page=1`);
    const movieData = await movieResponse.json();
    
    // Recherche de séries
    const tvResponse = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&language=fr-FR&query=${query}&page=1`);
    const tvData = await tvResponse.json();
    
    // Combiner les résultats (limiter à 5 de chaque pour ne pas surcharger)
    const movieResults = movieData.results ? movieData.results.slice(0, 5) : [];
    const tvResults = tvData.results ? tvData.results.slice(0, 5) : [];
    
    const allResults = [...movieResults, ...tvResults]; // Combiner les résultats des deux
    displayResults(allResults);
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats:', error);
    resultsContainer.innerHTML = '<div class="p-3 text-white text-center">Une erreur est survenue</div>';
  }
}

// Ajouter un écouteur d'événements pour le champ de recherche
export function initSearch() {
  console.log('Initialisation de la recherche...');
  
  // Réessayez de récupérer l'élément s'il est null
  if (!searchInput) {
    console.log('Récupération de l\'élément search_input');
    searchInput = document.getElementById('search_input');
  }
  
  // Vérifier que l'élément existe
  if (searchInput) {
    console.log('Élément search_input trouvé, ajout de l\'écouteur d\'événements');
    
    // Ajout du conteneur de résultats après l'input
    const searchContainer = document.querySelector('.search_bar');
    if (searchContainer) {
      // S'assurer que le conteneur parent est positionné correctement
      searchContainer.style.position = 'relative';
      
      // Vérifier si le conteneur de résultats existe déjà
      const existingContainer = searchContainer.querySelector('#results-container');
      if (!existingContainer) {
        // Placer le conteneur de résultats à la bonne position
        searchContainer.appendChild(resultsContainer);
        console.log('Conteneur de résultats ajouté');
      }
    } else {
      console.error('Conteneur de recherche (.search_bar) non trouvé');
    }
    
    // Ajouter l'événement d'écoute
    searchInput.addEventListener('input', handleSearch);
    console.log('Écouteur d\'événement de recherche initialisé avec succès');
    
    // Ajouter un événement pour cacher les résultats en cliquant ailleurs
    document.addEventListener('click', (e) => {
      if (!searchContainer.contains(e.target)) {
        resultsContainer.innerHTML = '';
      }
    });
  } else {
    console.error("L'élément de recherche (search_input) n'a pas été trouvé dans le DOM");
  }
}