export function createCarousel({ containerId, items, getTitle, getImage }) {
    const section = document.getElementById(containerId);
    if (!section) {
      console.warn(`Conteneur #${containerId} introuvable`);
      return;
    }
  
    const carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'relative overflow-hidden';
  
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&#10094;';
    prevBtn.className = 'absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70';
    carouselWrapper.appendChild(prevBtn);
  
    const carousel = document.createElement('div');
    carousel.className = 'flex transition-transform duration-300 ease-in-out';
    carouselWrapper.appendChild(carousel);
  
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '&#10095;';
    nextBtn.className = 'absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70';
    carouselWrapper.appendChild(nextBtn);
  
    section.appendChild(carouselWrapper);
  
    // ------------------------------
    // Responsive : détection largeur
    // ------------------------------
    let currentIndex = 0;
    const totalToShow = 15;
    let itemWidth = 0;
    let visibleCount = 5;
  
    function updateVisibleCount() {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) visibleCount = 2;
      else if (screenWidth < 768) visibleCount = 3;
      else if (screenWidth < 1024) visibleCount = 4;
      else visibleCount = 5;
    }
  
    updateVisibleCount();
    window.addEventListener('resize', () => {
      updateVisibleCount();
      updateCarousel();
    });
  
    function updateCarousel() {
      const offset = currentIndex * itemWidth;
      carousel.style.transform = `translateX(-${offset}px)`;
    }
  
    function scrollNext() {
      const maxIndex = totalToShow - visibleCount;
      if (currentIndex < maxIndex) currentIndex++;
      updateCarousel();
    }
  
    function scrollPrev() {
      if (currentIndex > 0) currentIndex--;
      updateCarousel();
    }
  
    nextBtn.addEventListener('click', scrollNext);
    prevBtn.addEventListener('click', scrollPrev);
  
    // ------------------------------
    // Touch swipe (mobile gesture)
    // ------------------------------
    let startX = 0;
  
    carouselWrapper.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });
  
    carouselWrapper.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;
  
      if (deltaX > 50) scrollPrev();
      else if (deltaX < -50) scrollNext();
    });
  
    // ------------------------------
    // Injection des éléments
    // ------------------------------
    const displayedItems = items.slice(0, totalToShow);
    displayedItems.forEach((item) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 px-2 flex-shrink-0';
  
      const img = document.createElement('img');
      img.src = getImage(item) || '/assets/images/no-poster.jpg';
      img.alt = getTitle(item);
      img.className = 'rounded-lg w-full h-72 object-cover shadow-lg hover:scale-105 transition';
  
      const title = document.createElement('p');
      title.textContent = getTitle(item);
      title.className = 'mt-2 text-sm text-center truncate';
  
      itemDiv.appendChild(img);
      itemDiv.appendChild(title);
      carousel.appendChild(itemDiv);
    });
  
    // ------------------------------
    // Calcul de la largeur réelle
    // ------------------------------
    setTimeout(() => {
      const firstItem = carousel.querySelector('div');
      if (firstItem) {
        itemWidth = firstItem.offsetWidth + 16; // padding horizontal
        updateCarousel();
      }
    }, 100);
  }
  