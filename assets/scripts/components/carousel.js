export function createCarousel({ containerId, items, getTitle, getImage }) {
    // Création de la structure principale du carousel
    const section = document.createElement('section');
    section.className = "carousel-section relative";

    // Création du titre du carousel
    const heading = document.createElement('h2');
    heading.textContent = "Films populaires";
    heading.className = "text-2xl font-bold text-white mb-4 px-4";

    // Création du conteneur pour les éléments défilants
    const carouselContainer = document.createElement('div');
    carouselContainer.id = containerId;
    carouselContainer.className = "flex overflow-hidden space-x-4 px-4";

    // Ajout des éléments (images) au carousel
    items.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex-shrink-0 w-1/5';

        const image = document.createElement('img');
        image.src = getImage(item);
        image.alt = getTitle(item);
        image.className = "w-full h-72 object-cover rounded-lg shadow-lg hover:scale-105 transition";

        itemDiv.appendChild(image);
        carouselContainer.appendChild(itemDiv);
    });

    // Création des boutons de navigation
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&rarr;';  // Flèche droite
    nextButton.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-600 text-white px-4 py-2 rounded-full z-10';

    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&larr;';  // Flèche gauche
    prevButton.className = 'absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-600 text-white px-4 py-2 rounded-full z-10';

    // Assemblage des éléments du carousel
    section.appendChild(heading);
    section.appendChild(carouselContainer);
    section.appendChild(nextButton);
    section.appendChild(prevButton);

    // Ajout du carousel à la page
    const main = document.querySelector('main') || document.body;
    main.appendChild(section);

    // Variables de contrôle pour la navigation
    let currentIndex = 0;
    const totalItems = items.length;

    // Fonction pour mettre à jour la position du carousel
    function updateCarousel() {
        // Calcul des dimensions pour le défilement
        const itemWidth = carouselContainer.querySelector('div').offsetWidth + 16; // Largeur + marge
        const visibleItems = Math.floor(carouselContainer.offsetWidth / itemWidth);
        const offset = currentIndex * itemWidth;

        // Journalisation pour le débogage
        console.log('currentIndex:', currentIndex);
        console.log('offset:', offset);
        console.log('visibleItems:', visibleItems);

        // Application du déplacement horizontal
        carouselContainer.style.transform = `translateX(-${offset}px)`;
        carouselContainer.offsetHeight; // Force le rafraîchissement du rendu
    }

    // Gestion du clic sur le bouton suivant
    nextButton.addEventListener('click', () => {
        const itemWidth = carouselContainer.querySelector('div').offsetWidth + 16;
        const visibleItems = Math.floor(carouselContainer.offsetWidth / itemWidth);

        // Avancer si possible
        if (currentIndex < totalItems - visibleItems) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Gestion du clic sur le bouton précédent
    prevButton.addEventListener('click', () => {
        const itemWidth = carouselContainer.querySelector('div').offsetWidth + 16;
        const visibleItems = Math.floor(carouselContainer.offsetWidth / itemWidth);

        // Reculer si possible
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    // Gestion des interactions tactiles (swipe)
    let startX = 0;
    let isScrolling = false;

    carouselContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
        isScrolling = true;
    });

    carouselContainer.addEventListener('touchmove', (e) => {
        if (!isScrolling) return;
        const moveX = e.touches[0].pageX;
        
        // Swipe vers la droite (précédent)
        if (moveX - startX > 50) {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
            isScrolling = false;
        } 
        // Swipe vers la gauche (suivant)
        else if (startX - moveX > 50) {
            const itemWidth = carouselContainer.querySelector('div').offsetWidth + 16;
            const visibleItems = Math.floor(carouselContainer.offsetWidth / itemWidth);

            if (currentIndex < totalItems - visibleItems) {
                currentIndex++;
                updateCarousel();
            }
            isScrolling = false;
        }
    });

    // Gestion du défilement à la molette
    carouselContainer.addEventListener('wheel', (e) => {
        const itemWidth = carouselContainer.querySelector('div').offsetWidth + 16;
        const visibleItems = Math.floor(carouselContainer.offsetWidth / itemWidth);

        // Défilement vers le bas = avancer
        if (e.deltaY > 0) {
            if (currentIndex < totalItems - visibleItems) {
                currentIndex++;
                updateCarousel();
            }
        } 
        // Défilement vers le haut = reculer
        else {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        }
    });

    // Initialisation du carousel
    updateCarousel();
}