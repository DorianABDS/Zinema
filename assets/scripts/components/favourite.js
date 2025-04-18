// Gestion du localStorage
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}

export function toggleFavorite(id, type) {
  const favorites = getFavorites();
  const index = favorites.findIndex(f => f.id == id && f.type === type);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push({ id: Number(id), type });
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  return index === -1;
}

// Met à jour l'affichage des étoiles
export function updateStarUI(starContainer, isFavorite) {
  const starNormal = starContainer.querySelector('[data-state="normal"]');
  const starFavorite = starContainer.querySelector('[data-state="favorite"]');

  starNormal.style.display = isFavorite ? 'none' : 'block';
  starFavorite.style.display = isFavorite ? 'block' : 'none';
}

// Écouteur global pour toutes les étoiles
export function initializeFavoriteButtons() {
  document.addEventListener('click', (e) => {
    const starContainer = e.target.closest('.star-container');
    if (starContainer) {
      e.preventDefault();
      e.stopPropagation(); // Gardé pour éviter la navigation
      const id = starContainer.dataset.id;
      const type = starContainer.dataset.type;
      const isFavorite = toggleFavorite(id, type);
      updateStarUI(starContainer, isFavorite);
    }
  });
}

// Synchronise l'état au chargement
export function syncFavorites() {
  const favorites = getFavorites();
  document.querySelectorAll('.star-container').forEach(container => {
    const id = container.dataset.id;
    const type = container.dataset.type;
    const isFavorite = favorites.some(f => f.id == id && f.type === type);
    updateStarUI(container, isFavorite);
  });
}

// Ajouter l'export manquant pour checkCurrentFavorite
export function checkCurrentFavorite() {
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');
  const itemType = urlParams.get('type');
  
  if (!itemId || !itemType) return false;

  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  return favorites.some(fav => fav.id == itemId && fav.type === itemType);
}