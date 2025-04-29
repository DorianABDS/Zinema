const API_KEY = '8c4b867188ee47a1d4e40854b27391ec'; // Replace with your TMDB key
const BASE_URL = 'https://api.themoviedb.org/3';

// Fonction pour récupérer les détails du film avec les plateformes
async function fetchMovieDetails(movieId) {
  try {
    const [detailsRes, creditsRes, videosRes, providersRes] = await Promise.all([
      fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=fr-FR`),
      fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=fr-FR`),
      fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=fr-FR`),
      fetch(`${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`)
    ]);

    if (!detailsRes.ok || !creditsRes.ok || !videosRes.ok || !providersRes.ok) {
      throw new Error('Error retrieving data');
    }

    const details = await detailsRes.json();
    const credits = await creditsRes.json();
    const videos = await videosRes.json();
    const providers = await providersRes.json();

    // Recherche d'abord une bande-annonce en français
    let trailer = videos.results.find(
      video => video.type === "Trailer" && video.site === "YouTube" && video.iso_639_1 === "fr"
    );
    if (!trailer) {
      trailer = videos.results.find(
        video => video.type === "Trailer" && video.site === "YouTube"
      );
    }

    const actors = credits.cast.slice(0, 5).map(actor => ({
      name: actor.name,
      character: actor.character,
      photo: actor.profile_path
        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
        : null
    }));

    // Ajout des plateformes de visionnage
    const offersFR = providers.results?.FR || {};
    const availableOn = {
      flatrate: offersFR.flatrate?.map(p => ({
        name: p.provider_name,
        logo: `https://image.tmdb.org/t/p/w45${p.logo_path}`
      })) || [],
      rent: offersFR.rent?.map(p => ({
        name: p.provider_name,
        logo: `https://image.tmdb.org/t/p/w45${p.logo_path}`
      })) || [],
      buy: offersFR.buy?.map(p => ({
        name: p.provider_name,
        logo: `https://image.tmdb.org/t/p/w45${p.logo_path}`
      })) || []
    };

    return {
      id: details.id,
      title: details.title,
      overview: details.overview,
      poster: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
      rating: details.vote_average,
      release_date: details.release_date,
      genres: details.genres.map(g => g.name),
      actors: actors,
      trailer: trailer ? trailer.key : null,
      watchProviders: availableOn
    };
  } catch (error) {
    console.error('Error in fetchMovieDetails:', error);
    return null;
  }
}

// Fonction pour récupérer les détails de la série avec les plateformes
async function fetchSeriesDetails(id) {
  const BASE_URL = 'https://api.themoviedb.org/3';
  const API_KEY = '8c4b867188ee47a1d4e40854b27391ec';

  async function fetchWithLanguage(lang) {
    const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=${lang}&append_to_response=credits`);
    if (!response.ok) throw new Error("Error loading series details");
    return response.json();
  }

  try {
    let data = await fetchWithLanguage('fr-FR');
    
    // Récupérons les vidéos
    const videosRes = await fetch(`${BASE_URL}/tv/${id}/videos?api_key=${API_KEY}&language=fr-FR`);
    if (!videosRes.ok) throw new Error("Error loading videos");
    const videos = await videosRes.json();
    
    // Recherche d'abord une bande-annonce en français
    let trailer = videos.results.find(
      video => video.type === "Trailer" && video.site === "YouTube" && video.iso_639_1 === "fr"
    );

    if (!trailer) {
      trailer = videos.results.find(
        video => video.type === "Trailer" && video.site === "YouTube"
      );
    }

    // Si l'overview est vide, on charge en anglais
    if (!data.overview || data.overview.trim() === '') {
      console.warn('French overview unavailable, loading in English...');
      const fallbackData = await fetchWithLanguage('en-US');
      data.overview = fallbackData.overview;
    }

    return {
      title: data.name,
      release_date: data.first_air_date,
      overview: data.overview,
      rating: data.vote_average,
      poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
      genres: data.genres.map(g => g.name),
      actors: data.credits?.cast.slice(0, 10).map(a => ({
        name: a.name,
        character: a.character,
        photo: a.profile_path ? `https://image.tmdb.org/t/p/w200${a.profile_path}` : null
      })),
      trailer: trailer ? trailer.key : null
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { fetchMovieDetails, fetchSeriesDetails };