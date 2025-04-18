const API_KEY = '8c4b867188ee47a1d4e40854b27391ec';
const BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Récupère les reviews d'un film
 * @param {number} movieId
 */
export async function fetchMovieReviews(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/reviews?api_key=${API_KEY}&language=fr-FR`);
        const data = await response.json();
        return data.results; // tableau des reviews
    } catch (error) {
        console.error('Erreur lors de la récupération des reviews du film:', error);
        return [];
    }
}

/**
 * Récupère les reviews d'une série TV
 * @param {number} tvId
 */
export async function fetchTvReviews(tvId) {
    try {
        const response = await fetch(`${BASE_URL}/tv/${tvId}/reviews?api_key=${API_KEY}&language=fr-FR`);
        const data = await response.json();
        return data.results; // tableau des reviews
    } catch (error) {
        console.error('Erreur lors de la récupération des reviews de la série:', error);
        return [];
    }
}