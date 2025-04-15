// search.js

const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');

// Fonction pour afficher les résultats de l'autocomplétion
function displayResults(results) {
  resultsContainer.innerHTML = ''; // Effacer les résultats précédents

  results.forEach(result => {
    const resultItem = document.createElement('div');
    resultItem.classList.add('result-item');
    resultItem.textContent = result.title || result.name; // Modifier selon les données de l'API
    resultsContainer.appendChild(resultItem);
  });
}

// Fonction de recherche avec autocomplétion
function handleSearch() {
  const query = searchInput.value.trim();

  if (query.length >= 1) { // Lance la recherche après 1 caractères
    fetchAutocompleteResults(query);
  } else {
    resultsContainer.innerHTML = ''; // Effacer si moins de 1 caractères
  }
}

// Fonction pour récupérer les résultats de l'API d'autocomplétion
async function fetchAutocompleteResults(query) {
  try {
    const seriesResults = await getPopularSeries(query); // Appel à ta fonction getPopularSeries
    const moviesResults = await getPopularMovies(query); // Appel à ta fonction getPopularMovies
    const allResults = [...seriesResults, ...moviesResults]; // Combiner les résultats des deux
    displayResults(allResults);
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats:', error);
  }
}

// Ajouter un écouteur d'événements pour le champ de recherche
searchInput.addEventListener('input', handleSearch);
