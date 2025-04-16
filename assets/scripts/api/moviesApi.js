const API_KEY = '810f7bae435ef7e7f5d46a2c4deb733e';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export async function fetchMoviesPage(page = 1) {
  try {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    const data = await response.json();
    return {
      results: data.results.slice(0, 12),
      totalResults: data.total_results
    };
  } catch (error) {
    console.error('Erreur films:', error);
    throw error;
  }
}

export function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card relative w-48 mb-6 cursor-pointer transition-all duration-300 hover:scale-105';
  
  const img = document.createElement('img');
  img.src = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : '/assets/images/no-poster.jpg';
  img.alt = movie.title;
  img.className = 'w-full rounded-lg shadow-lg';
  img.dataset.movieId = movie.id;

  card.addEventListener('click', () => {
    window.location.href = `details.html?id=${movie.id}&type=movie`;
  });

  const title = document.createElement('p');
  title.textContent = movie.title;
  title.className = 'text-white text-center mt-2 font-medium';

  const date = document.createElement('p');
  date.textContent = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  date.className = 'text-gray-400 text-center text-sm';

  if (movie.vote_average) {
    const rating = document.createElement('span');
    rating.className = 'absolute top-2 right-2 px-2 py-1 rounded-full text-sm ring-1 ring-inset ring-yellow-600/50 dark:bg-black/60 dark:text-yellow-300 dark:ring-yellow-300/20';
    rating.textContent = movie.vote_average.toFixed(1);
    card.appendChild(rating);
  }

  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(date);

  return card;
}
