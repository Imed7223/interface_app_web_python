
document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:8000/api/v1/titles";
    const genresUrl = "http://localhost:8000/api/v1/genres/?page_size=100";

    async function fetchGenres() {
        try {
            const response = await fetch(genresUrl); // appel à l’API
            const data = await response.json(); // transformation JSON
            return data.results; // on retourne la liste des genres
        } catch (error) {
            console.error("Erreur lors de la récupération des genres:", error);
            return [];
        }
    }

    async function populateGenreSelect() {
        const genres = await fetchGenres(); // récupère les genres via l'API
        const selectElement = document.getElementById("category-select");

        // Nettoyer les options existantes (garder seulement l'option par défaut)
        selectElement.innerHTML = '<option value="">-- Choisissez une catégorie --</option>';

        // Pour chaque genre récupéré, on crée une <option> dans le <select>
        genres.forEach(genre => {
            const option = document.createElement("option");
            option.value = genre.name; // valeur de l’option (utilisée en backend)
            option.textContent = genre.name; // ce que voit l’utilisateur
            selectElement.appendChild(option); // on l’ajoute à la liste déroulante
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
        const movies = await fetchMovies(`${apiUrl}?sort_by=-imdb_score&page_size=6`); // Récupère les 6 meilleurs films triés par score IMDb décroissante
        if (movies.length > 0) {
            const bestMovie = movies[0];

            const response = await fetch(bestMovie.url); // pour récupérer plus de détails sur ce film (par exemple description, image_url, etc.)
            const BestMovieData = await response.json();
            //Construit dynamiquement du HTML qu’il insère dans un conteneur <div id="best-movie-container">
            document.getElementById("best-movie-container").innerHTML = `
        <div class="flex border border-black border-[2mm] overflow-hidden shadow-lg w-full ">
            <img src="${BestMovieData.image_url}" alt="${BestMovieData.title}" class="w-1/3 object-cover">
            <div class="w-2/3 p-4 bg-white flex flex-col justify-between items-end">
                <div class="w-full">
                    <h3 class="text-lg font-semibold text-black">${BestMovieData.title}</h3>
                    <p class="text-sm text-gray-600">${BestMovieData.description }</p>
                </div>
                <button class="bg-red-500 text-white px-4 py-2 rounded mt-4 self-end" onclick="openModal(${BestMovieData.id})">
                    Détails
                </button>
            </div>
        </div>
    `;
        }
    }
    // Afficher 6 films dans une section HTML (une catégorie), avec un arrière-plan image, un titre et un bouton Détails
    async function displayMovies(categoryId, query) {
        const movies = await fetchMovies(`${apiUrl}?${query}&sort_by=-imdb_score&page_size=6`);// ça permet de demander les 6 meilleurs films d’un genre particulier
        //  fetchMovies()récupère les films, et on construit le HTML pour chaque film avec .map()
        document.getElementById(categoryId).innerHTML = movies.map(movie => `
        <div class="relative image-box" style="background-image:url('${movie.image_url}')">
        <div class=" top-0 left-0 w-full h-full bg-black bg-opacity-10">
             <h1 class="absolute top-40 left-4 bg-black bg-opacity-60 text-white font-bold text-2xl px-3 py-1 ">
                ${movie.title}
            </h1>
            <button class="bg-gray-900 text-white px-7 py-1 rounded-3xl font-bold shadow-md absolute top-1/2 right-4 transform -translate-y-1/2 shadow-md"
                onclick="openModal(${movie.id})">
                Détails
            </button></div>
            
        </div>
    `).join('');
    }

    async function populateCategories() {
        const categories = ["Drama", "Comedy", "Sci-Fi"]; // Crée un tableau (Ce sont les 3 genres qu’on veut afficher sur la page)
        categories.forEach((cat, index) => {
            displayMovies(`category-${index + 1}`, `genre=${cat}`); // Pour Drama → displayMovies("category-1", "genre=Drama")

                                                                    //Pour Comedy → displayMovies("category-2", "genre=Comedy")

                                                                    //Pour Sci-Fi → displayMovies("category-3", "genre=Sci-Fi")
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
            // Injecte le HTML dans le Modal
            document.getElementById("modal-content").innerHTML = `
            
           <div class=" texte relative bg-red p-20 shadow-lg max-w-3xl mx-auto border-4 border-black min-h-[600px]">
               <button id="close-modal" class="close-icon  bg-red-500 text-white px-6 py-1 rounded-3xl font-semibold shadow-md ">
                   x
               </button>
       
    <img src="${movie.image_url}" alt="${movie.title}" class='photoP' />
              
    <h1 class= " text-3xl font-bold text-gray-800 mt-4  "><strong>${movie.title}</strong></h1>
    <p class="text-lg text-gray-600  "><strong>Genre: ${movie.genres.join(', ')}</strong></p>
    <p class="text-lg text-gray-900 "><strong>Date de sortie: ${movie.date_published}</strong></p>
    <p class="text-lg text-gray-900  "><strong>Classification : ${movie.rated}</strong></p>
        <p class="text-lg text-gray-900 "><strong>Score IMDB: ${movie.imdb_score}/10</strong></p>

    <!-- Texte décalé sous l'image -->
    <div class="mt-6 " >
        <p class="  text-s text-gray-600"><strong>Réalisé par:</strong></p>
         <p>${movie.directors.join(', ')}</p></div >
    <div class="mt-17 ">
        <p class="  text-s text-gray-600"><strong>Acteurs:</strong> ${movie.actors.join(', ')}</p>
        <p class=" text-s text-gray-600"><strong>Durée:</strong> ${movie.duration} minutes</p>
        <p class="  text-s text-gray-600"><strong>Pays d'origine:</strong> ${movie.countries.join(', ')}</p>
            <p class=" text-s text-gray-600"><strong>Box Office:</strong> ${movie.worldwide_gross_income || "Non disponible"}</p>
        <img src="${movie.image_url}" alt="${movie.title} "  class="photoM"/>
        <div class="mt-6" > 
               <p class="text-s text-gray-600"><strong>Résumé:</strong> ${movie.description || "Aucune description disponible"}
        
    </div>
    </div>
        <div class="flex justify-center">
        <button id="close-modal" class="detail-button  bg-red-500 text-white px-6 py-1 rounded-3xl font-semibold shadow-md ">
            Fermer
        </button> 
    </div>
    </div>
</div>

        `;
            document.getElementById("movie-modal").style.display = "flex" ;// Affiche la modale
        } catch (error) {
            console.error("Erreur lors du chargement du film:", error);
        }
    };



    document.addEventListener("click", (event) => {
        if (event.target.id === "close-modal" || event.target.id === "movie-modal") {
            document.getElementById("movie-modal").style.display = "none";
        }
    });

    // Initialisation
    populateGenreSelect();
    displayBestMovie();
    displayMovies("top-rated-movies", "");
    populateCategories();
});

