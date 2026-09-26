const storageKey = 'local-favorites-tracker';
const form = document.getElementById('add-favorite-form');
const favoritesList = document.getElementById('favorites-list');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

let favorites = loadFavorites();

function loadFavorites() {
    try {
        return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch (error) {
        return [];
    }
}

function saveFavorites() {
    localStorage.setItem(storageKey, JSON.stringify(favorites));
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function addFavorite(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const name = formData.get('name').trim();
    const category = formData.get('category');

    if (!name || !category) {
        return;
    }

    favorites.push({
        id: Date.now().toString(),
        name: name,
        category: category,
        rating: Number(formData.get('rating')),
        notes: formData.get('notes').trim(),
        dateAdded: new Date().toLocaleDateString()
    });

    saveFavorites();
    form.reset();
    displayFavorites();
}

function deleteFavorite(index) {
    const favorite = favorites[index];
    if (confirm(`Delete "${favorite.name}"?`)) {
        favorites.splice(index, 1);   // remove 1 item at index
        saveFavorites();
        searchFavorites();            // re-render, keeping current filter
    }
}

function searchFavorites() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;

    const filtered = favorites.filter(function(favorite) {
        const matchesSearch = searchText === '' ||
            favorite.name.toLowerCase().includes(searchText) ||
            favorite.notes.toLowerCase().includes(searchText);
        const matchesCategory = selectedCategory === 'all' ||
            favorite.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    favoritesList.innerHTML = '';

    if (favorites.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No favorites yet. Add your first favorite place above!';
        favoritesList.appendChild(emptyMessage);
        return;
    }

    if (filtered.length === 0) {
        const noMatchMessage = document.createElement('p');
        noMatchMessage.className = 'empty-message';
        noMatchMessage.textContent = 'No favorites match your search.';
        favoritesList.appendChild(noMatchMessage);
        return;
    }

    filtered.forEach(function(favorite) {
        const index = favorites.indexOf(favorite);
        favoritesList.innerHTML += `
            <article class="favorite-card">
                <h3>${escapeHtml(favorite.name)}</h3>
                <span class="favorite-category">${escapeHtml(favorite.category)}</span>
                <div class="favorite-rating">${'★'.repeat(Number(favorite.rating))}${'☆'.repeat(5 - Number(favorite.rating))}</div>
                <p class="favorite-notes">${escapeHtml(favorite.notes || 'No notes added.')}</p>
                <small>Added: ${escapeHtml(favorite.dateAdded)}</small>
                <button class="btn-danger" onclick="deleteFavorite(${index})">Delete</button>
            </article>`;
    });
}

function displayFavorites() {
    searchInput.value = '';          // clear the search box
    categoryFilter.value = 'all';    // back to All categories
    searchFavorites();
}

form.addEventListener('submit', addFavorite);
searchInput.addEventListener('input', searchFavorites);
categoryFilter.addEventListener('change', searchFavorites);

displayFavorites();