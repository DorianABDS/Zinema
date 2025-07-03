import { getPopularSeries } from '../api/seriesApi.js';
import { createCarousel } from '../components/carousel.js';

export async function initCarouselSeries() {
  const series = await getPopularSeries();

  createCarousel({
    containerId: 'series-carousel-section',
    items: series,

    getTitle: (serie) => serie.name,

    getImage: (serie) =>
      serie.poster_path ? `https://image.tmdb.org/t/p/w500${serie.poster_path}` : '/assets/images/no-poster.jpg',

    carouselTitle: "Séries populaires"
  });

  const carouselItems = document.querySelectorAll('#series-carousel-section > div');
  carouselItems.forEach((item, index) => {
    const serie = series[index];
    const link = document.createElement('a');
    link.href = `../pages/details.html?id=${serie.id}&type=tv`;

    while (item.firstChild) {
      link.appendChild(item.firstChild);
    }
    
    item.appendChild(link);
  });
}