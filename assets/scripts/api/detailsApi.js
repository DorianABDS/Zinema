const API_KEY = '8c4b867188ee47a1d4e40854b27391ec'; // Remplace par ta clé TMDB
const BASE_URL = 'https://api.themoviedb.org/3';

async function fetchMovieDetails(movieId) {
  try {
    // Requête principale pour les infos du film
    const [detailsRes, creditsRes] = await Promise.all([
      fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=fr-FR`),
      fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=fr-FR`)
    ]);

    if (!detailsRes.ok || !creditsRes.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }

    const details = await detailsRes.json();
    const credits = await creditsRes.json();

    // On prend les 5 premiers acteurs principaux
    const acteurs = credits.cast.slice(0, 5).map(acteur => ({
      nom: acteur.name,
      personnage: acteur.character,
      photo: acteur.profile_path
        ? `https://image.tmdb.org/t/p/w185${acteur.profile_path}`
        : null
    }));

    return {
      id: details.id,
      titre: details.title,
      resume: details.overview,
      affiche: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
      note: details.vote_average,
      date_sortie: details.release_date,
      genres: details.genres.map(g => g.name),
      acteurs: acteurs
    };
  } catch (error) {
    console.error('Erreur dans fetchMovieDetails:', error);
    return null;
  }
}
export async function fetchSeriesDetails(id) {
    const BASE_URL = 'https://api.themoviedb.org/3';
    const API_KEY = '8c4b867188ee47a1d4e40854b27391ec';
  
    async function fetchWithLanguage(lang) {
      const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=${lang}&append_to_response=credits`);
      if (!response.ok) throw new Error("Erreur lors du chargement des détails de la série");
      return response.json();
    }
  
    try {
      let data = await fetchWithLanguage('fr-FR');
  
      // Si le résumé est vide, re-tente en anglais
      if (!data.overview || data.overview.trim() === '') {
        console.warn('Résumé français indisponible, chargement en anglais...');
        const fallbackData = await fetchWithLanguage('en-US');
        data.overview = fallbackData.overview;
      }
  
      return {
        titre: data.name,
        date_sortie: data.first_air_date,
        resume: data.overview,
        note: data.vote_average,
        affiche: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
        genres: data.genres.map(g => g.name),
        acteurs: data.credits?.cast.slice(0, 10).map(a => ({
          nom: a.name,
          personnage: a.character,
          photo: a.profile_path ? `https://image.tmdb.org/t/p/w200${a.profile_path}` : null
        }))
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

// Exemple d'utilisation
fetchMovieDetails(550) // 550 = Fight Club
  .then(data => console.log(data));

export { fetchMovieDetails };