// Créez un nouveau fichier: api/recommendationsApi.js
export async function fetchMovieRecommendations(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=8c4b867188ee47a1d4e40854b27391ec&language=fr-FR&page=1`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Impossible de récupérer les recommandations de films');
      }
      const data = await response.json();
      return data.results.slice(0, 10); // Limiter à 10 recommandations
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations de films:', error);
      return [];
    }
  }
  
  export async function fetchSeriesRecommendations(seriesId) {
    const url = `https://api.themoviedb.org/3/tv/${seriesId}/recommendations?api_key=8c4b867188ee47a1d4e40854b27391ec&language=fr-FR&page=1`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Impossible de récupérer les recommandations de séries');
      }
      const data = await response.json();
      return data.results.slice(0, 10); // Limiter à 10 recommandations
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations de séries:', error);
      return [];
    }
  }
