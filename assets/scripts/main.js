// Chemin d'importation corrigé - ne pas utiliser ./ mais un chemin relatif à l'emplacement du fichier
import { displayMovieImages } from './api/moviesApi.js';

// Fonction d'initialisation principale
async function init() {
  // Détermine quelle page est chargée
  const currentPage = window.location.pathname;
  
  console.log('Main.js chargé. Page actuelle:', currentPage);
  
  // Page Films
  if (currentPage.includes('movies.html')) {
    console.log('Page Films détectée, chargement des films...');
    try {
      await displayMovieImages();
      console.log('Films chargés avec succès');
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
    // Ajouter le code pour afficher les séries ici
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
}

// Attendre que le DOM soit chargé avant d'initialiser
document.addEventListener('DOMContentLoaded', init);