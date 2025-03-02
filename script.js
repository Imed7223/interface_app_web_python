
document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:8000/api/v1/titles";
    const genresUrl = "http://localhost:8000/api/v1/genres/?page_size=100";

    async function fetchGenres() {
        try {
            const response = await fetch(genresUrl);
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error("Erreur lors de la récupération des genres:", error);
            return [];
        }
    }

    async function populateGenreSelect() {
        const genres = await fetchGenres();
        const selectElement = document.getElementById("category-select");

        // Nettoyer les options existantes (garder seulement l'option par défaut)
        selectElement.innerHTML = '<option value="">-- Choisissez une catégorie --</option>';

        // Ajouter dynamiquement les genres récupérés
        genres.forEach(genre => {
            const option = document.createElement("option");
            option.value = genre.name;
            option.textContent = genre.name;
            selectElement.appendChild(option);
        });
    }

    async function fetchMovies(url) {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    }

    async function fetchMovieDetails(id) {
        const response = await fetch(`${apiUrl}/${id}`);
        return await response.json();
    }

    async function displayBestMovie() {
        const movies = await fetchMovies(`${apiUrl}?sort_by=-imdb_score&page_size=6`);
        if (movies.length > 0) {
            const bestMovie = movies[0];
            document.getElementById("best-movie-container").innerHTML = `
        <div class="flex border border-black border-[2mm] overflow-hidden shadow-lg w-full ">
            <img src="${bestMovie.image_url}" alt="${bestMovie.title}" class="w-1/3 object-cover">
            <div class="w-2/3 p-4 bg-white flex flex-col justify-between items-end">
                <div class="w-full">
                    <h3 class="text-lg font-semibold text-black">${bestMovie.title}</h3>
                    <p class="text-sm text-gray-600">${bestMovie.description || "Aucune description disponible"}</p>
                </div>
                <button class="bg-red-500 text-white px-4 py-2 rounded mt-4 self-end" onclick="openModal(${bestMovie.id})">
                    Détails
                </button>
            </div>
        </div>
    `;
        }
    }

    async function displayMovies(categoryId, query) {
        const movies = await fetchMovies(`${apiUrl}?${query}&sort_by=-imdb_score&page_size=6`);
        document.getElementById(categoryId).innerHTML = movies.map(movie => `
            <div class="image-box" onclick="openModal(${movie.id})" style="background-image:url('${movie.image_url}') ">
               
                <h4 class="text-sm mt-1">${movie.title}</h4>
            </div>
        `).join('')

    }

    async function populateCategories() {
        const categories = ["Drama", "Comedy", "Sci-Fi"];
        categories.forEach((cat, index) => {
            displayMovies(`category-${index + 1}`, `genre=${cat}`);
        });
    }

    // Ajout du listener pour la catégorie libre
    document.getElementById("category-select").addEventListener("change", async (event) => {
        const selectedCategory = event.target.value;
        const categoryContainer = document.getElementById("category-custom");

        if (selectedCategory) {
            categoryContainer.innerHTML = "<p>Chargement des films...</p>";
            await displayMovies("category-custom", `genre=${selectedCategory}`);
        } else {
            categoryContainer.innerHTML = "<p>Aucune catégorie sélectionnée</p>";
        }
    });

    window.openModal = async function(id) {
        try {
            const movie = await fetchMovieDetails(id);
            document.getElementById("modal-content").innerHTML = `
                <img src="${movie.image_url}" alt="${movie.title}" class="w-full rounded-lg" />
                <h2 class="text-2xl font-bold mt-4">${movie.title}</h2>
                <p><strong>Genre:</strong> ${movie.genres.join(', ')}</p>
                <p><strong>Date de sortie:</strong> ${movie.date_published}</p>
                <p><strong>Classification:</strong> ${movie.rated}</p>
                <p><strong>Score IMDB:</strong> ${movie.imdb_score}</p>
                <p><strong>Réalisateur:</strong> ${movie.directors.join(', ')}</p>
                <p><strong>Acteurs:</strong> ${movie.actors.join(', ')}</p>
                <p><strong>Durée:</strong> ${movie.duration} minutes</p>
                <p><strong>Pays d'origine:</strong> ${movie.countries.join(', ')}</p>
                <p><strong>Box Office:</strong> ${movie.worldwide_gross_income || "Non disponible"}</p>
                <p><strong>Résumé:</strong> ${movie.description || "Aucune description disponible"}</p>
                
            `;
            document.getElementById("movie-modal").style.display = "flex";
        } catch (error) {
            console.error("Erreur lors du chargement du film:", error);
        }
    };

    document.getElementById("close-modal").addEventListener("click", () => {
        document.getElementById("movie-modal").style.display = "none";
    });

    document.addEventListener("click", (event) => {
        if (event.target.id === "close-modal" || event.target.id === "movie-modal") {
            document.getElementById("movie-modal").style.display = "none";
        }

    });

    // Initialisation
    populateGenreSelect();  // Ajouté ici
    displayBestMovie();
    displayMovies("top-rated-movies", "");
    populateCategories();
});
