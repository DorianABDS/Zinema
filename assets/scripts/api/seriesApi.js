// === CONFIG GLOBALE (commune aux deux modules) ===
const API_KEY = '810f7bae435ef7e7f5d46a2c4deb733e';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

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

export function createSeriesCard(serie) {
  const card = document.createElement('div');
  card.className = 'movie-card relative w-48 mb-6 cursor-pointer transition-all duration-300 hover:scale-105';

  const img = document.createElement('img');
  img.src = serie.poster_path ? `${IMAGE_BASE_URL}${serie.poster_path}` : '/assets/images/no-poster.jpg';
  img.alt = serie.name;
  img.className = 'w-full rounded-lg shadow-lg';
  img.dataset.seriesId = serie.id;

  card.addEventListener('click', () => {
    window.location.href = `details.html?id=${serie.id}&type=tv`;
  });

  const title = document.createElement('p');
  title.textContent = serie.name;
  title.className = 'text-white text-center mt-2 font-medium';

  const date = document.createElement('p');
  date.textContent = serie.first_air_date ? new Date(serie.first_air_date).getFullYear() : '';
  date.className = 'text-gray-400 text-center text-sm';

  

  if (serie.vote_average) {
    const rating = document.createElement('div');
    rating.className = 'absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-full text-sm';
    rating.textContent = serie.vote_average.toFixed(1);
    card.appendChild(rating);
  }

  // Conteneur rond noir pour l'étoile, même style que le rating
  const starContainer = document.createElement('div');
  starContainer.className = 'absolute top-2 left-2 bg-black/60 rounded-full w-7 h-7 flex items-center justify-center z-10 ring-1 ring-inset ring-yellow-600/50';

  // Étoile normale (contour blanc)
  const starNormal = document.createElement('img');
  starNormal.src = 'https://cdn-icons-png.flaticon.com/512/13/13595.png';
  starNormal.alt = 'Étoile';
  starNormal.className = 'w-4 h-4';
  starNormal.style.filter = 'invert(1)';
  starNormal.style.display = 'block';
  starNormal.dataset.state = 'normal';

  // Étoile favorite (jaune) - masquée
  const starFavorite = document.createElement('img');
  starFavorite.src = 'https://cdn-icons-png.flaticon.com/512/13/13595.png';
  starFavorite.alt = 'Étoile favorite';
  starFavorite.className = 'w-5 h-5';
  starFavorite.style.filter = 'invert(0.9) sepia(1) saturate(10) hue-rotate(0deg) brightness(1.2)';
  starFavorite.style.display = 'none';
  starFavorite.dataset.state = 'favorite';

  starContainer.appendChild(starNormal);
  starContainer.appendChild(starFavorite);

  // Empêche la navigation quand on clique sur l'étoile
  starContainer.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  card.appendChild(starContainer);



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
      const card = createSeriesCard(serie);
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
