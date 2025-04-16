// Récupération du champ de recherche dans le DOM
let searchInput = document.getElementById('search_input');

// Création d'un conteneur pour afficher les résultats d'autocomplétion
const resultsContainer = document.createElement('div');
resultsContainer.id = 'results-container';
resultsContainer.classList.add(
  'absolute', 'bg-gray-800', 'rounded', 'mt-1', 'w-full', 'z-10',
  'top-full', 'left-0', 'max-h-96', 'overflow-y-auto'
);

// Affichage des résultats d'autocomplétion
function displayResults(results) {
  resultsContainer.innerHTML = ''; // Vider les anciens résultats

  if (results.length === 0) {
    // Aucun résultat trouvé
    const noResults = document.createElement('div');
    noResults.classList.add('p-3', 'text-white', 'text-center');
    noResults.textContent = 'Aucun résultat trouvé';
    resultsContainer.appendChild(noResults);
    return;
  }

  // Boucle sur chaque résultat (film ou série)
  results.forEach(result => {
    const resultItem = document.createElement('div');
    resultItem.classList.add('result-item', 'p-2', 'hover:bg-gray-700', 'cursor-pointer', 'text-white');

    const type = result.title ? 'movie' : 'tv'; // Détection du type via la présence de `title`
    const title = result.title || result.name; // Titre à afficher

    resultItem.textContent = title;

    // Redirection vers la page de détails au clic
    resultItem.addEventListener('click', () => {
      window.location.href = `details.html?id=${result.id}&type=${type}`;
    });

    resultsContainer.appendChild(resultItem);
  });
}

// Gère les entrées utilisateur dans le champ de recherche
export function handleSearch() {
  if (!searchInput || !searchInput.value) {
    console.error("searchInput n'est pas défini ou n'a pas de valeur");
    return;
  }

  const query = searchInput.value.trim();

  if (query.length >= 1) {
    // Lance la recherche à partir d'un caractère
    fetchAutocompleteResults(query);
  } else {
    resultsContainer.innerHTML = ''; // Vide les résultats si l'entrée est trop courte
  }
}

// Fonction de requête à l'API pour films et séries
export async function fetchAutocompleteResults(query) {
  try {
    const API_KEY = '8c4b867188ee47a1d4e40854b27391ec';
    const BASE_URL = 'https://api.themoviedb.org/3';

    // Appel API pour les films
    const movieResponse = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=fr-FR&query=${query}&page=1`);
    const movieData = await movieResponse.json();

    // Appel API pour les séries
    const seriesResponse = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&language=fr-FR&query=${query}&page=1`);
    const seriesData = await seriesResponse.json();

    // Fusionner les 5 premiers résultats de chaque type
    const movieResults = movieData.results ? movieData.results.slice(0, 5) : [];
    const seriesResults = seriesData.results ? seriesData.results.slice(0, 5) : [];
    const allResults = [...movieResults, ...seriesResults];

    // Affichage
    displayResults(allResults);
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats:', error);
    resultsContainer.innerHTML = '<div class="p-3 text-white text-center">Une erreur est survenue</div>';
  }
}

// Initialisation de la recherche et des événements associés
export function initSearch() {
  console.log('Initialisation de la recherche...');

  // Si l'élément n'existe pas encore, on essaie de le récupérer à nouveau
  if (!searchInput) {
    console.log('Récupération de l\'élément search_input');
    searchInput = document.getElementById('search_input');
  }

  // Vérifie que l'input est bien présent
  if (searchInput) {
    console.log('Élément search_input trouvé, ajout de l\'écouteur d\'événements');

    // Cherche le conteneur autour du champ de recherche
    const searchContainer = document.querySelector('.search_bar');

    if (searchContainer) {
      // Positionne correctement le parent pour un positionnement absolu du conteneur
      searchContainer.style.position = 'relative';

      // Évite d’ajouter plusieurs fois le conteneur de résultats
      const existingContainer = searchContainer.querySelector('#results-container');
      if (!existingContainer) {
        searchContainer.appendChild(resultsContainer);
        console.log('Conteneur de résultats ajouté');
      }
    } else {
      console.error('Conteneur de recherche (.search_bar) non trouvé');
    }

    // Lance la recherche à chaque frappe
    searchInput.addEventListener('input', handleSearch);
    console.log('Écouteur d\'événement de recherche initialisé avec succès');

    // Ferme les résultats si on clique en dehors
    document.addEventListener('click', (e) => {
      if (!searchContainer.contains(e.target)) {
        resultsContainer.innerHTML = '';
      }
    });
  } else {
    console.error("L'élément de recherche (search_input) n'a pas été trouvé dans le DOM");
  }
}
