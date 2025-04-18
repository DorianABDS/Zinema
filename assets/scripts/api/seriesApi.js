// === CONFIG GLOBALE (commune aux deux modules) ===
const API_KEY = '810f7bae435ef7e7f5d46a2c4deb733e';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
import { toggleFavorite, updateStarUI } from '../components/favourite.js';

let currentPage = 1;

// ==========================
// === MODULE 1 : Séries Populaires - chargement initial uniquement ===
// ==========================
export async function getPopularSeries(page = 1, limit = null) {
  try {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    const data = await response.json();

    const results = limit ? data.results.slice(0, limit) : data.results;
    return results;
  } catch (error) {
    console.error('Erreur lors de la récupération des séries:', error);
    throw error;
  }
}

export function createSeriesCard(series) {
  const card = document.createElement('div');
  card.className = 'movie-card relative w-48 mb-6 cursor-pointer transition-all duration-300 hover:scale-105';

  const img = document.createElement('img');
  img.src = series.poster_path ? `${IMAGE_BASE_URL}${series.poster_path}` : '/assets/images/no-poster.jpg';
  img.alt = series.name;
  img.className = 'w-full rounded-lg shadow-lg';
  img.dataset.seriesId = series.id;

  card.addEventListener('click', () => {
    window.location.href = `details.html?id=${series.id}&type=tv`;
  });

  const title = document.createElement('p');
  title.textContent = series.name;
  title.className = 'text-white text-center mt-2 font-medium';

  const date = document.createElement('p');
  date.textContent = series.first_air_date ? new Date(series.first_air_date).getFullYear() : '';
  date.className = 'text-gray-400 text-center text-sm';

  if (series.vote_average) {
    const rating = document.createElement('div');
    rating.className = 'absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-full text-sm';
    rating.textContent = series.vote_average.toFixed(1);
    card.appendChild(rating);
  }

  // Crée le bouton étoile - CORRIGÉ
  const starButton = document.createElement('button');
  starButton.type = 'button';
  starButton.className = 'star-container absolute top-2 left-2 bg-black/60 rounded-full w-7 h-7 flex items-center justify-center z-10 ring-1 ring-inset ring-yellow-600/50 focus:outline-none';
  starButton.dataset.id = series.id;    // Les attributs data sont maintenant sur le bouton
  starButton.dataset.type = 'tv';      // Les attributs data sont maintenant sur le bouton
  starButton.setAttribute('aria-label', 'Ajouter ou retirer des favoris');

  // SVG étoile vide (blanche)
  const starEmpty = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  starEmpty.setAttribute('viewBox', '0 0 24 24');
  starEmpty.setAttribute('fill', 'none');
  starEmpty.setAttribute('stroke', 'white');
  starEmpty.setAttribute('stroke-width', '2');
  starEmpty.setAttribute('class', 'w-4 h-4 absolute pointer-events-none');
  starEmpty.dataset.state = 'normal';
  starEmpty.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>`;

  // SVG étoile pleine (jaune)
  const starFull = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  starFull.setAttribute('viewBox', '0 0 24 24');
  starFull.setAttribute('fill', '#FFD600');
  starFull.setAttribute('class', 'w-4 h-4 absolute pointer-events-none');
  starFull.style.display = 'none';
  starFull.dataset.state = 'favorite';
  starFull.innerHTML = `<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>`;

  starButton.appendChild(starEmpty);
  starButton.appendChild(starFull);

  starButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = starButton.dataset.id;
    const type = starButton.dataset.type;
    const isFavorite = toggleFavorite(id, type);
    updateStarUI(starButton, isFavorite);
  });

  card.appendChild(starButton);

  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(date);

  return card;
}

function createSeriesContainer() {
  const main = document.getElementById('main');
  const container = document.createElement('div');
  container.className = 'movies-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-6 place-items-center';
  main.appendChild(container);
  return container;
}

export async function initializeSeriesPage() {
  try {
    const main = document.getElementById('main');
    if (!main) return;

    main.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'text-white text-center pt-6 pb-4';
    header.innerHTML = '<h1 class="text-3xl font-bold">Séries Populaires</h1>';
    main.appendChild(header);

    const container = createSeriesContainer();
    const initialSeries = await getPopularSeries(currentPage);

    if (!initialSeries.length) {
      container.innerHTML = '<div class="text-white text-center p-10">Aucune série trouvée</div>';
      return;
    }

    initialSeries.forEach(serie => {
      const card = createSeriesCard(series);
      container.appendChild(card);
    });

  } catch (error) {
    const main = document.getElementById('main');
    if (main) {
      main.innerHTML = `
        <div class="text-center text-white p-10">
          <h2 class="text-2xl">Erreur de chargement</h2>
          <p class="mt-4">Impossible de charger les séries: ${error.message}</p>
        </div>
      `;
    }
  }
}

// ==========================
// === MODULE 2 : Récupération paginée simple (indépendant) ===
// ==========================
export async function fetchSeriesPage(page = 1) {
  try {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    const data = await response.json();
    return {
      results: data.results.slice(0, 12),
      totalResults: data.total_results
    };
  } catch (error) {
    console.error('Erreur séries:', error);
    throw error;
  }
}
