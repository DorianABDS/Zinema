const API_KEY = '810f7bae435ef7e7f5d46a2c4deb733e';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let isLoading = false;
let hasMoreSeries = true;

export async function getPopularSeries(page = 1) {
  try {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    const data = await response.json();

    if (data.results?.length) {
      if (page >= data.total_pages) hasMoreSeries = false;
      return data.results;
    } else {
      hasMoreSeries = false;
      return [];
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des séries:', error);
    throw error;
  }
}

function createSeriesCard(serie) {
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

export async function loadMoreSeries() {
  if (isLoading || !hasMoreSeries) return;

  try {
    isLoading = true;

    const container = document.querySelector('.movies-container') || createSeriesContainer();

    const loader = document.createElement('div');
    loader.className = 'loading-indicator flex justify-center items-center p-4 w-full';
    loader.innerHTML = '<div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>';
    container.appendChild(loader);

    currentPage++;
    const series = await getPopularSeries(currentPage);

    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) loadingIndicator.remove();

    series.forEach(serie => {
      const card = createSeriesCard(serie);
      container.appendChild(card);
    });

    isLoading = false;

    if (!hasMoreSeries) {
      const endMessage = document.createElement('div');
      endMessage.className = 'text-white text-center p-4 w-full';
      endMessage.textContent = "Vous avez atteint la fin de la liste des séries populaires.";
      container.appendChild(endMessage);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des séries:', error);
    isLoading = false;
  }
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

    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMoreSeries();
      }
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