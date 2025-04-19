//  Imports 
import { fetchMoviesPage, createMovieCard, initializeMoviesPage } from './api/moviesApi.js';
import { fetchSeriesPage, createSeriesCard, initializeSeriesPage } from './api/seriesApi.js';
import { createPagination } from './components/pagination.js';
import { initSearch } from './components/search.js';
import { fetchAutocompleteResults } from './components/search.js';
import { fetchSeriesDetails, fetchMovieDetails } from './api/detailsApi.js';
import { fetchMovieReviews, fetchTvReviews } from './api/reviewApi.js';
import { initializeFavoritesPage } from './components/displayFavourite.js';
import { initializeFavoriteButtons, syncFavorites, checkCurrentFavorite, updateStarUI, toggleFavorite } from './components/favourite.js';
import { initCarouselMovies } from './carousels/moviesCarousel.js';
import { initCarouselSeries } from './carousels/seriesCarousel.js';
import { renderHeroSection } from './components/hero.js';

async function loadContent(type, page) {
  const main = document.getElementById('main');
  main.innerHTML = '<div class="text-white p-4">Chargement...</div>';

  try {
    const fetchFn = type === 'movie' ? fetchMoviesPage : fetchSeriesPage;
    const createCardFn = type === 'movie' ? createMovieCard : createSeriesCard;
    
    const { results, totalResults } = await fetchFn(page);
    const totalPages = Math.min(Math.ceil(totalResults / 12), 500);

    const container = document.createElement('div');
    container.className = 'movies-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-6 place-items-center';
    results.forEach(item => container.appendChild(createCardFn(item)));

    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination flex justify-center pb-6';
    
    main.innerHTML = '';
    main.appendChild(container);  
    main.appendChild(paginationContainer);
    syncFavorites(); 

    createPagination({
      container: paginationContainer,
      currentPage: page,
      totalPages,
      onPageChange: (newPage) => loadContent(type, newPage)
    });

  } catch (error) {
    main.innerHTML = `<div class="text-red-500 p-4">Erreur: ${error.message}</div>`;
  }
}

  // Function to truncate text with a "See more" button
function createTruncatedContent(text, maxLength = 150) {
  const container = document.createElement('div');
  
  // If the text is short enough, display it directly
  if (text.length <= maxLength) {
    const content = document.createElement('p');
    content.className = 'text-sm mt-2';
    content.textContent = text;
    container.appendChild(content);
    return container;
  }
  
  // Otherwise, create an element for the truncated version
  const truncatedContent = document.createElement('p');
  truncatedContent.className = 'text-sm mt-2';
  truncatedContent.textContent = text.substring(0, maxLength) + '...';
  container.appendChild(truncatedContent);
  
  // And a "See more" button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'text-xs text-yellow-400 hover:text-yellow-300 mt-1';
  toggleButton.textContent = 'Voir plus';
  container.appendChild(toggleButton);
  
  // State to track if we're displaying the full text or truncated
  let isExpanded = false;
  
  // Event handler for the button
  toggleButton.addEventListener('click', () => {
    if (isExpanded) {
      // Reduce the text
      truncatedContent.textContent = text.substring(0, maxLength) + '...';
      toggleButton.textContent = 'Voir plus';
    } else {
      // Display the full text
      truncatedContent.textContent = text;
      toggleButton.textContent = 'Voir moins';
    }
    isExpanded = !isExpanded;
  });
  
  return container;
}

// Modified function to display reviews and form, with star rating system
function renderReviews(reviews) {
  const main = document.getElementById('main');
  if (!main) return;

  // Get the media ID and type from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const mediaId = urlParams.get('id');
  const mediaType = urlParams.get('type');
  
  // Get user reviews from localStorage
  const userReviews = getUserReviews(mediaId, mediaType);
  
  const container = document.createElement('div');
  container.className = 'max-w-4xl mx-auto mt-6 bg-gray-900 rounded-xl p-6 text-white shadow-md';
  
  const title = document.createElement('h3');
  title.className = 'text-2xl font-bold mb-4';
  title.textContent = 'Avis';
  container.appendChild(title);
  
  // Display API reviews
  if (Array.isArray(reviews) && reviews.length > 0) {
    const apiReviewsTitle = document.createElement('h4');
    apiReviewsTitle.className = 'text-xl font-semibold mb-3 text-gray-300';
    apiReviewsTitle.textContent = 'Avis des utilisateurs';
    container.appendChild(apiReviewsTitle);
    
    reviews.forEach(review => {
      const reviewBlock = document.createElement('div');
      reviewBlock.className = 'mb-4 border-b border-gray-700 pb-4';
      
      const authorContainer = document.createElement('div');
      authorContainer.className = 'flex justify-between items-center';
      
      const author = document.createElement('p');
      author.className = 'text-sm font-semibold text-yellow-300';
      author.textContent = `Auteur: ${review.author}`;
      authorContainer.appendChild(author);
      
      // Add rating with stars if available
      if (review.author_details && review.author_details.rating) {
        const ratingStars = document.createElement('div');
        ratingStars.className = 'flex text-yellow-400';
        
        // Calculate number of stars to display (scale 0-10)
        const starCount = Math.round(review.author_details.rating / 2);
        for (let i = 0; i < 5; i++) {
          const star = document.createElement('span');
          star.innerHTML = i < starCount ? '&#9733;' : '&#9734;';
          star.className = 'text-lg';
          ratingStars.appendChild(star);
        }
        
        authorContainer.appendChild(ratingStars);
      }
      
      reviewBlock.appendChild(authorContainer);
      
      // Use the function for truncated content
      const contentContainer = createTruncatedContent(review.content);
      reviewBlock.appendChild(contentContainer);
      
      container.appendChild(reviewBlock);
    });
  } else if (Array.isArray(reviews)) {
    const noApiReview = document.createElement('p');
    noApiReview.className = 'text-gray-400 mb-4';
    noApiReview.textContent = 'Aucun avis disponible';
    container.appendChild(noApiReview);
  }
  
  // Divider
  const divider = document.createElement('hr');
  divider.className = 'my-6 border-gray-700';
  container.appendChild(divider);
  
  // Display user reviews from localStorage
  if (userReviews && userReviews.length > 0) {
    const userReviewsTitle = document.createElement('h4');
    userReviewsTitle.className = 'text-xl font-semibold mb-3 text-gray-300';
    userReviewsTitle.textContent = 'Vos avis';
    container.appendChild(userReviewsTitle);
    
    userReviews.forEach((review, index) => {
      const reviewBlock = document.createElement('div');
      reviewBlock.className = 'mb-4 border-b border-gray-700 pb-4 relative';
      
      const header = document.createElement('div');
      header.className = 'flex justify-between items-center';
      
      const author = document.createElement('p');
      author.className = 'text-sm font-semibold text-yellow-300';
      author.textContent = `Auteur: ${review.author}`;
      header.appendChild(author);
      
      if (review.rating) {
        const ratingStars = document.createElement('div');
        ratingStars.className = 'flex text-yellow-400';
        
        // Calculate number of stars to display (scale 0-10)
        const starCount = Math.round(review.rating / 2);
        for (let i = 0; i < 5; i++) {
          const star = document.createElement('span');
          star.innerHTML = i < starCount ? '&#9733;' : '&#9734;';
          star.className = 'text-lg';
          ratingStars.appendChild(star);
        }
        
        header.appendChild(ratingStars);
      }
      
      reviewBlock.appendChild(header);
      
      // Use the function for truncated content
      const contentContainer = createTruncatedContent(review.content);
      reviewBlock.appendChild(contentContainer);
      
      if (review.created_at) {
        const date = document.createElement('p');
        date.className = 'text-xs text-gray-500 mt-2';
        date.textContent = `Publié le ${new Date(review.created_at).toLocaleDateString()}`;
        reviewBlock.appendChild(date);
      }
      
      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'absolute top-10 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center';
      deleteButton.innerHTML = '×';
      deleteButton.title = 'Supprimer cet avis';
      deleteButton.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
          deleteReview(mediaId, mediaType, index);
          location.reload(); // Refresh page to update display
        }
      });
      reviewBlock.appendChild(deleteButton);
      
      container.appendChild(reviewBlock);
    });
  }
  
  // Add review form
  const formTitle = document.createElement('h4');
  formTitle.className = 'text-xl font-semibold my-4 text-gray-300';
  formTitle.textContent = 'Ajouté votre avis';
  container.appendChild(formTitle);
  
  const form = document.createElement('form');
  form.id = 'reviewForm';
  form.className = 'space-y-4';
  
  // Username
  const nameGroup = document.createElement('div');
  const nameLabel = document.createElement('label');
  nameLabel.htmlFor = 'username';
  nameLabel.className = 'block text-sm font-medium mb-1';
  nameLabel.textContent = 'Votre nom :';
  
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'username';
  nameInput.name = 'username';
  nameInput.className = 'w-full bg-gray-800 text-white rounded p-2 border border-gray-700';
  nameInput.required = true;
  
  nameGroup.appendChild(nameLabel);
  nameGroup.appendChild(nameInput);
  form.appendChild(nameGroup);
  
  // Review content
  const contentGroup = document.createElement('div');
  const contentLabel = document.createElement('label');
  contentLabel.htmlFor = 'reviewContent';
  contentLabel.className = 'block text-sm font-medium mb-1';
  contentLabel.textContent = 'Votre avis:';
  
  const contentTextarea = document.createElement('textarea');
  contentTextarea.id = 'reviewContent';
  contentTextarea.name = 'reviewContent';
  contentTextarea.rows = 5;
  contentTextarea.className = 'w-full bg-gray-800 text-white rounded p-2 border border-gray-700';
  contentTextarea.required = true;
  
  contentGroup.appendChild(contentLabel);
  contentGroup.appendChild(contentTextarea);
  form.appendChild(contentGroup);
  
  // Rating with stars (replaces numeric field)
  const ratingGroup = document.createElement('div');
  const ratingLabel = document.createElement('label');
  ratingLabel.htmlFor = 'rating';
  ratingLabel.className = 'block text-sm font-medium mb-1';
  ratingLabel.textContent = 'Votre note:';
  ratingGroup.appendChild(ratingLabel);

  // Container for stars
  const starsContainer = document.createElement('div');
  starsContainer.className = 'flex items-center space-x-1 mb-4';

  // Hidden input to store the value
  const ratingInput = document.createElement('input');
  ratingInput.type = 'hidden';
  ratingInput.id = 'rating';
  ratingInput.name = 'rating';
  ratingInput.value = '0';
  starsContainer.appendChild(ratingInput);

  // Create 5 stars (scale 0-10, so each star is worth 2 points)
  for (let i = 1; i <= 5; i++) {
    const starWrapper = document.createElement('div');
    starWrapper.className = 'cursor-pointer';
    starWrapper.dataset.value = i * 2;
    
    const star = document.createElement('span');
    star.className = 'text-2xl text-gray-400 hover:text-yellow-400';
    star.innerHTML = '&#9733;'; // Full star character
    star.id = `star-${i}`;
    
    // Add event listener for click
    starWrapper.addEventListener('click', function() {
      const value = this.dataset.value;
      ratingInput.value = value;
      
      // Update star appearance
      for (let j = 1; j <= 5; j++) {
        const currentStar = document.getElementById(`star-${j}`);
        if (j <= value/2) {
          currentStar.className = 'text-2xl text-yellow-400';
        } else {
          currentStar.className = 'text-2xl text-gray-400';
        }
      }
    });
    
    // Add hover effect
    starWrapper.addEventListener('mouseover', function() {
      const hoverValue = this.dataset.value;
      for (let j = 1; j <= 5; j++) {
        const currentStar = document.getElementById(`star-${j}`);
        if (j <= hoverValue/2) {
          currentStar.className = 'text-2xl text-yellow-400';
        } else if (j > hoverValue/2 && ratingInput.value/2 >= j) {
          // Keep colored stars already selected
          currentStar.className = 'text-2xl text-yellow-400';
        } else {
          currentStar.className = 'text-2xl text-gray-400';
        }
      }
    });
    
    starWrapper.addEventListener('mouseout', function() {
      const currentValue = ratingInput.value;
      for (let j = 1; j <= 5; j++) {
        const currentStar = document.getElementById(`star-${j}`);
        if (j <= currentValue/2) {
          currentStar.className = 'text-2xl text-yellow-400';
        } else {
          currentStar.className = 'text-2xl text-gray-400';
        }
      }
    });
    
    starWrapper.appendChild(star);
    starsContainer.appendChild(starWrapper);
  }

  ratingGroup.appendChild(starsContainer);
  form.appendChild(ratingGroup);
  
  // Submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded';
  submitButton.textContent = 'Publié mon avis';
  form.appendChild(submitButton);
  
  // Event listener for form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = nameInput.value.trim();
    const content = contentTextarea.value.trim();
    const rating = parseFloat(ratingInput.value);
    
    if (rating === 0) {
      alert('Veuillez donner une note en cliquant sur les étoiles.');
      return;
    }
    
    saveReview(mediaId, mediaType, username, content, rating);
    
    // Reset form
    form.reset();
    
    // Refresh page to show new review
    location.reload();
  });
  
  container.appendChild(form);
  main.appendChild(container);
}

// Function to save a review in localStorage
function saveReview(mediaId, mediaType, username, content, rating) {
  // Create a unique key for this media (movie or series)
  const storageKey = `reviews_${mediaType}_${mediaId}`;
  
  // Get existing reviews or initialize empty array
  let reviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  // Create new review with timestamp
  const newReview = {
    author: username,
    content: content,
    rating: rating,
    created_at: new Date().toISOString()
  };
  
  // Add review to array
  reviews.push(newReview);
  
  // Save to localStorage
  localStorage.setItem(storageKey, JSON.stringify(reviews));
  
  // Show confirmation message
  alert('Votre avis a été publié !');
}

// Function to get user reviews from localStorage
function getUserReviews(mediaId, mediaType) {
  const storageKey = `reviews_${mediaType}_${mediaId}`;
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
}

// Function to delete a review
function deleteReview(mediaId, mediaType, reviewIndex) {
  const storageKey = `reviews_${mediaType}_${mediaId}`;
  
  // Get existing reviews
  let reviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  // Check that index is valid
  if (reviewIndex >= 0 && reviewIndex < reviews.length) {
    // Delete review at specified index
    reviews.splice(reviewIndex, 1);
    
    // Update localStorage
    localStorage.setItem(storageKey, JSON.stringify(reviews));
    
    return true;
  }
  
  return false;
}

async function init() {
  const currentPage = window.location.pathname;
  console.log('Main.js loaded. Current page:', currentPage);

  const isDetailPage = currentPage.includes('details.html');
  const isFavoritesPage = currentPage.includes('favorites.html');
  const isHomePage =
    currentPage.includes('index.html') ||
    currentPage === '/' ||
    currentPage === '/index.html';

  // ----- MOVIES PAGE -----
  if (currentPage.includes('movies.html')) {
    console.log('Page Films détectée, chargement des films...');
    initSearch();
    initializeFavoriteButtons();
    loadContent('movie', 1);

    const query = ''; // à adapter selon ton besoin réel
    fetchAutocompleteResults(query);
  }

  // ----- SERIES PAGE -----
  else if (currentPage.includes('series.html')) {
    console.log('Page Séries détectée, chargement des séries...');
    initSearch();
    initializeFavoriteButtons();
    loadContent('series', 1);

    const query = ''; // à adapter selon ton besoin réel
    fetchAutocompleteResults(query);
  }

  // ----- DETAILS PAGE -----
  else if (isDetailPage) {
    console.log('Page Détails détectée');
    initSearch();
    initializeFavoriteButtons();

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type');

    try {
      if (id && type === 'movie') {
        const movie = await fetchMovieDetails(id);
        movie.id = id;
        movie.type = 'movie';
        renderDetails(movie);
        const reviews = await fetchMovieReviews(id);
        renderReviews(reviews);
        syncFavorites();
      } else if (id && type === 'tv') {
        const serie = await fetchSeriesDetails(id);
        serie.id = id;
        serie.type = 'tv';
        renderDetails(serie);
        const reviews = await fetchTvReviews(id);
        renderReviews(reviews);
        syncFavorites();
      }
    } catch (error) {
      console.error('Error loading details:', error);
    }
  }

  // ----- FAVORITES PAGE -----
  else if (isFavoritesPage) {
    console.log('Favorites page loaded');
    initSearch();
    initializeFavoriteButtons();
    // Logic favoris à ajouter ici
  }

  // ----- HOME PAGE -----
  else if (isHomePage) {
    console.log('Home page loaded');
    initSearch();

    try {
      await renderHeroSection();
      await initCarouselMovies();
      await initCarouselSeries();
    } catch (error) {
      console.error('Erreur lors du chargement des carousels :', error);
    }
  }

  // ----- MOBILE MENU -----
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('overlay');

  function toggleMenu() {
    mobileMenu?.classList.toggle('translate-x-full');
    overlay?.classList.toggle('hidden');
  }

  burger?.addEventListener('click', toggleMenu);
  overlay?.addEventListener('click', toggleMenu);
}

// Démarre une fois le DOM prêt
document.addEventListener('DOMContentLoaded', init);

// ----- Common display function (movies + series) -----
function renderDetails(media) {
  const main = document.getElementById('main');
  if (!main) return;

  const container = document.createElement('div');
  container.className = 'max-w-4xl mx-auto mt-10 bg-gray-800 rounded-xl p-6 text-white shadow-lg';
  container.style.position = 'relative';

  // Create flex container for title and star
  const headerContainer = document.createElement('div');
  headerContainer.className = 'flex justify-between items-center mb-4';
  const title = document.createElement('h2');
  title.className = 'text-3xl font-bold';
  title.textContent = media.title; // Changed from titre to title
  headerContainer.appendChild(title);

  const starButton = document.createElement('button');
  starButton.type = 'button';
  starButton.id = 'detailStarContainer';
  starButton.className = 'star-container relative w-6 h-6 focus:outline-none';
  starButton.setAttribute('aria-label', 'Ajouter ou retirer des favoris');
  starButton.dataset.id = String(media.id);  
  starButton.dataset.type = media.type; 

  const starEmpty = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  starEmpty.setAttribute('viewBox', '0 0 24 24');
  starEmpty.setAttribute('fill', 'none');
  starEmpty.setAttribute('stroke', 'white');
  starEmpty.setAttribute('stroke-width', '2');
  starEmpty.setAttribute('class', 'w-6 h-6 absolute top-0 left-0 pointer-events-none');
  starEmpty.dataset.state = 'normal';
  starEmpty.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>`;

  const starFull = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  starFull.setAttribute('viewBox', '0 0 24 24');
  starFull.setAttribute('fill', '#FFD600');
  starFull.setAttribute('class', 'w-6 h-6 absolute top-0 left-0 pointer-events-none');
  starFull.style.display = 'none';
  starFull.dataset.state = 'favorite';
  starFull.innerHTML = `<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>`;
  
  starButton.appendChild(starEmpty);
  starButton.appendChild(starFull);


  starButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = starButton.dataset.id;
    const type = starButton.dataset.type;
    const isFavorite = toggleFavorite(id, type);
    updateStarUI(starButton, isFavorite);
  });
  headerContainer.appendChild(starButton);
  // Container for both star states (normal and favorite)
  const starContainer = document.createElement('div');
  starContainer.className = 'relative w-6 h-6';
  
  // Normal star (white outline)
  const starNormal = document.createElement('img');
  starNormal.src = 'https://cdn-icons-png.flaticon.com/512/13/13595.png';
  starNormal.alt = 'Star';
  starNormal.className = 'w-6 h-6 absolute top-0 left-0';
  starNormal.style.filter = 'invert(1)';
  starNormal.style.display = 'block'; // Hidden by default
  starNormal.dataset.state = 'normal';
  starContainer.appendChild(starNormal);
  
  // Yellow star (for favorite state) - initially hidden
  const starFavorite = document.createElement('img');
  starFavorite.src = 'https://cdn-icons-png.flaticon.com/512/13/13595.png';
  starFavorite.alt = 'Favorite star';
  starFavorite.className = 'w-6 h-6 absolute top-0 left-0';
  starFavorite.style.filter = 'invert(0.9) sepia(1) saturate(10) hue-rotate(0deg) brightness(1.2)';
  starFavorite.style.display = 'none'; // Hidden by default
  starFavorite.dataset.state = 'favorite';
  starContainer.appendChild(starFavorite);
  
  container.appendChild(headerContainer);

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'flex flex-col md:flex-row gap-6';

  const poster = document.createElement('img');
  poster.src = media.poster; // Changed from affiche to poster
  poster.alt = `Poster of ${media.title}`; // Changed from titre to title
  poster.className = 'rounded-lg w-full md:w-1/3';
  contentWrapper.appendChild(poster);

  const details = document.createElement('div');
  details.className = 'flex-1';

  const date = document.createElement('p');
  date.className = 'text-sm text-gray-400';
  date.textContent = `Date de sortie: ${media.release_date}`; // Changed from date_sortie to release_date
  details.appendChild(date);

  const note = document.createElement('p');
  note.className = 'text-sm text-yellow-400';
  note.textContent = `Note moyenne: ${media.rating}/10`; // Changed from note to rating
  details.appendChild(note);

  const genres = document.createElement('p');
  genres.className = 'text-sm text-gray-300 mb-4';
  genres.textContent = `Genres: ${media.genres.join(', ')}`;
  details.appendChild(genres);

  const overview = document.createElement('p');
  overview.className = 'mb-4';
  overview.textContent = media.overview; // Changed from resume to overview
  details.appendChild(overview);

  const actorsTitle = document.createElement('h3');
  actorsTitle.className = 'text-xl font-semibold mt-4 mb-2';
  actorsTitle.textContent = 'Acteurs principaux :';
  details.appendChild(actorsTitle);

  const actorList = document.createElement('div');
  actorList.className = 'grid grid-cols-2 gap-4';

  if (Array.isArray(media.actors)) {
    media.actors.forEach(actor => {
      const card = document.createElement('div');
    card.className = 'flex items-center gap-3';

    if (actor.photo) {
      const img = document.createElement('img');
      img.src = actor.photo;
      img.alt = actor.name; // Changed from nom to name
      img.className = 'w-12 h-12 rounded-full object-cover';
      card.appendChild(img);
    }

    const infos = document.createElement('div');
    const name = document.createElement('p'); // Changed from nom to name
    name.className = 'font-semibold';
    name.textContent = actor.name; // Changed from nom to name

    const role = document.createElement('p');
    role.className = 'text-sm text-gray-400';
    role.textContent = `Rôle: ${actor.character}`; // Changed from personnage to character
    
    infos.appendChild(name);
    infos.appendChild(role);
    card.appendChild(infos);

    actorList.appendChild(card);
  });
} else {
  const noActors = document.createElement('p');
  noActors.className = 'text-sm text-gray-400';
  noActors.textContent = 'Aucune information sur les acteurs disponible.';
  actorList.appendChild(noActors);
}

  details.appendChild(actorList);
  contentWrapper.appendChild(details);
  container.appendChild(headerContainer);
  container.appendChild(contentWrapper);
  main.appendChild(container);
}

// ----- Pages spécifiques -----
if (window.location.pathname.includes('favorites.html')) {
  initializeFavoritesPage();
} else if (window.location.pathname.includes('movies.html')) {
  initializeMoviesPage();
} else if (window.location.pathname.includes('series.html')) {
  initializeSeriesPage();
}