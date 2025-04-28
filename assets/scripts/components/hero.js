import { getPopularMovies } from '../api/moviesApi.js'; 

let currentIndex = 0;
let intervalId;
let movies = [];

export async function renderHeroSection() {
  movies = await getPopularMovies();
  if (movies.length === 0) return; // sécurité : si jamais aucun film n'est trouvé

  const images = movies.map(movie => `https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`);

  const hero = document.createElement('section');
  hero.id = 'hero';
  hero.className = 'relative w-full h-[80vh] bg-cover bg-center text-white flex items-center transition-all duration-1000';
  hero.style.backgroundImage = `url('${images[0]}')`;

  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 bg-black opacity-60';

  const content = document.createElement('div');
  content.className = 'relative z-10 text-left px-8'; // aligné à gauche

  const titleLink = document.createElement('a');
  titleLink.className = 'block'; // tout le bloc est cliquable

  const title = document.createElement('h1');
  title.className = 'text-4xl md:text-6xl font-bold mb-4';

  content.appendChild(titleLink);
  titleLink.appendChild(title);
  hero.appendChild(overlay);
  hero.appendChild(content);

  const main = document.querySelector('main') || document.body;
  main.prepend(hero);

  // ✅ Ici on appelle une fonction pour initialiser correctement TOUT de suite l'affichage
  updateHeroContent(title, titleLink);

  startBackgroundRotation(hero, images, title, titleLink);
}

// 💡 Nouvelle fonction pour factoriser la mise à jour
function updateHeroContent(titleElement, titleLinkElement) {
  const movie = movies[currentIndex];
  titleElement.textContent = movie.title || movie.name || 'Titre inconnu';
  titleLinkElement.href = `../pages/details.html?id=${movie.id}&type=movie`;
}

function startBackgroundRotation(heroElement, imageArray, titleElement, titleLinkElement) {
  intervalId = setInterval(() => {
    currentIndex = (currentIndex + 1) % imageArray.length;
    heroElement.style.backgroundImage = `url('${imageArray[currentIndex]}')`;

    updateHeroContent(titleElement, titleLinkElement);
  }, 10000);
}
