export function createCarousel({ containerId, items, getTitle, getImage, carouselTitle = "Films populaires" }) {
    // SECTION PRINCIPALE
    const section = document.createElement('section');
    section.className = "carousel-section my-8 bg-gradient-to-b from-gray-900 via-black to-black/0 py-12 px-4 rounded-xl";

    // TITRE avec paramÃ¨tre personnalisable
    const heading = document.createElement('h2');
    heading.textContent = carouselTitle;
    heading.className = "text-3xl font-bold text-white mb-6 px-6";

    // CONTAINER GLOBAL AVEC FLECHES + CAROUSEL
    const controlWrapper = document.createElement('div');
    controlWrapper.className = "flex items-center space-x-4 px-6"; // plus de h-*

    // FLECHE GAUCHE
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&#10094;';
    prevButton.className = `
        bg-black/60 text-white text-3xl font-bold 
        w-12 rounded-lg flex items-center justify-center 
        hover:bg-black/80 transition shadow-lg self-stretch
    `;

    // WRAPPER DU CAROUSEL
    const carouselWrapper = document.createElement('div');
    carouselWrapper.className = "relative overflow-hidden flex-1";

    // CONTENEUR D'IMAGES
    const carouselContainer = document.createElement('div');
    carouselContainer.id = containerId;
    carouselContainer.className = "flex transition-transform duration-500 ease-in-out space-x-6";

    // AJOUT DES ELEMENTS
    items.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex-shrink-0 w-48 sm:w-56 md:w-64';

        const imageWrapper = document.createElement('div');
        imageWrapper.className = "relative overflow-hidden rounded-xl shadow-lg";

        const image = document.createElement('img');
        image.src = getImage(item);
        image.alt = getTitle(item);
        image.className = "w-full object-contain"; // pas de h-full, garde taille naturelle

        const titleOverlay = document.createElement('div');
        titleOverlay.className = "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-sm px-3 py-2";
        titleOverlay.textContent = getTitle(item);

        imageWrapper.appendChild(image);
        imageWrapper.appendChild(titleOverlay);
        itemDiv.appendChild(imageWrapper);
        carouselContainer.appendChild(itemDiv);
    });

    // FLECHE DROITE
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&#10095;';
    nextButton.className = `
        bg-black/60 text-white text-3xl font-bold 
        w-12 rounded-lg flex items-center justify-center 
        hover:bg-black/80 transition shadow-lg self-stretch
    `;

    // ASSEMBLAGE
    carouselWrapper.appendChild(carouselContainer);
    controlWrapper.appendChild(prevButton);
    controlWrapper.appendChild(carouselWrapper);
    controlWrapper.appendChild(nextButton);
    section.appendChild(heading);
    section.appendChild(controlWrapper);

    const main = document.querySelector('main') || document.body;
    main.appendChild(section);

    // SCROLL LOGIC
    let currentIndex = 0;
    const totalItems = items.length;

    function updateCarousel() {
        const itemWidth = carouselContainer.querySelector('div').offsetWidth + 24;
        const offset = currentIndex * itemWidth;
        carouselContainer.style.transform = `translateX(-${offset}px)`;
    }

    nextButton.addEventListener('click', () => {
        const itemWidth = carouselContainer.querySelector('div').offsetWidth + 24;
        const visibleItems = Math.floor(carouselWrapper.offsetWidth / itemWidth);
        if (currentIndex < totalItems - visibleItems) {
            currentIndex++;
            updateCarousel();
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    // TOUCH SUPPORT
    let startX = 0;
    let isScrolling = false;

    carouselContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
        isScrolling = true;
    });

    carouselContainer.addEventListener('touchmove', (e) => {
        if (!isScrolling) return;
        const moveX = e.touches[0].pageX;
        const delta = moveX - startX;
        const itemWidth = carouselContainer.querySelector('div').offsetWidth + 24;
        const visibleItems = Math.floor(carouselWrapper.offsetWidth / itemWidth);

        if (delta > 50 && currentIndex > 0) {
            currentIndex--;
            updateCarousel();
            isScrolling = false;
        } else if (delta < -50 && currentIndex < totalItems - visibleItems) {
            currentIndex++;
            updateCarousel();
            isScrolling = false;
        }
    });

    // WHEEL SUPPORT
    carouselContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const itemWidth = carouselContainer.querySelector('div').offsetWidth + 24;
        const visibleItems = Math.floor(carouselWrapper.offsetWidth / itemWidth);

        if (e.deltaY > 0 && currentIndex < totalItems - visibleItems) {
            currentIndex++;
            updateCarousel();
        } else if (e.deltaY < 0 && currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    updateCarousel();
}