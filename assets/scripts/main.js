// Import des fonctions depuis le fichier API
import { initializeMoviesPage } from './api/moviesApi.js';
import { initializeSeriesPage } from './api/seriesApi.js';
import { getAutocompleteResults } from './components/search.js';

// Fonction d'initialisation principale
async function init() {
  // Détermine quelle page est chargée
  const currentPage = window.location.pathname;
  
  console.log('Main.js chargé. Page actuelle:', currentPage);
  
  // Page Films
  if (currentPage.includes('movies.html')) {
    console.log('Page Films détectée, chargement des films...');
    try {
      await initializeMoviesPage();
      console.log('Page Films initialisée avec succès');
    } catch (error) {
      console.error('Erreur lors du chargement des films:', error);
      document.getElementById('main').innerHTML = `
        <div class="text-center text-white p-10">
          <h2 class="text-2xl">Erreur de chargement</h2>
          <p class="mt-4">Impossible de charger les films. Vérifiez votre clé API et votre connexion.</p>
          <p class="mt-2 text-red-500">${error.message}</p>
        </div>
      `;
    }
  }
  // Page Séries
  else if (currentPage.includes('series.html')) {
    console.log('Page Séries chargée');
    console.log('Page Séries détectée, chargement des séries...');
    try {
    await initializeSeriesPage();
    console.log('Page Séries initialisée avec succès');
    } catch (error) {
    console.error('Erreur lors du chargement des séries:', error);
    document.getElementById('main').innerHTML = `
        <div class="text-center text-white p-10">
        <h2 class="text-2xl">Erreur de chargement</h2>
        <p class="mt-4">Impossible de charger les séries. Vérifiez votre clé API et votre connexion.</p>
        <p class="mt-2 text-red-500">${error.message}</p>
        </div>
    `;
    }
  }
  // Page Détails
  else if (currentPage.includes('details.html')) {
    console.log('Page Détails chargée');
    
    // Récupère l'ID et le type depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type');
    
    if (id && type) {
      // Ajouter le code pour afficher les détails d'un film ou d'une série
      console.log(`Affichage des détails de ${type} avec l'ID: ${id}`);
    }
  }
  // Page Favoris
  else if (currentPage.includes('favorites.html')) {
    console.log('Page Favoris chargée');
    // Ajouter le code pour afficher les favoris ici
  }
  // Page d'accueil ou autre
  else {
    console.log('Page d\'accueil chargée');
    // Code spécifique à la page d'accueil si nécessaire
  }
  
  // main.js

// Fonction pour récupérer les séries populaires
async function getPopularSeries(query) {
  const response = await fetch(`https://api.example.com/series/popular?query=${query}`);
  const data = await response.json();
  return data.page;
}

// Fonction pour récupérer les films populaires
async function getPopularMovies(query) {
  const response = await fetch(`https://api.example.com/movies/popular?query=${query}`);
  const data = await response.json();
  return data.page;
}

}

// Attendre que le DOM soit chargé avant d'initialiser
document.addEventListener('DOMContentLoaded', init);