import { getPopularMovies } from '../api/moviesApi.js';

let currentIndex = 0;
let intervalId;

export async function renderHeroSection() {
  const movies = await getPopularMovies();
  const images = movies.map(movie => `https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`);

  const hero = document.createElement('section');
  hero.id = 'hero';
  hero.className = 'relative w-full h-[80vh] bg-cover bg-center text-white flex items-center justify-center transition-all duration-1000';
  hero.style.backgroundImage = `url('${images[0]}')`;

  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 bg-black opacity-60';

  const content = document.createElement('div');
  content.className = 'relative z-10 text-center px-4';

  const title = document.createElement('h1');
  title.className = 'text-4xl md:text-6xl font-bold mb-4';
  title.textContent = 'Bienvenue sur Zynema';

  const subtitle = document.createElement('p');
  subtitle.className = 'text-lg md:text-xl mb-6';
  subtitle.textContent = 'Découvrez les meilleurs films et séries en un clic';

  const button = document.createElement('a');
  button.href = 'movies.html';
  button.className = 'inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition';
  button.textContent = 'Explorer le catalogue';

  content.appendChild(title);
  content.appendChild(subtitle);
  content.appendChild(button);

  hero.appendChild(overlay);
  hero.appendChild(content);

  const main = document.querySelector('main') || document.body;
  main.prepend(hero);

  // 🚀 Lancement du diaporama
  startBackgroundRotation(hero, images);
}

function startBackgroundRotation(heroElement, imageArray) {
  intervalId = setInterval(() => {
    currentIndex = (currentIndex + 1) % imageArray.length;
    heroElement.style.backgroundImage = `url('${imageArray[currentIndex]}')`;
  }, 10000); // 10 secondes
}
