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

function displayFavorites() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const visibleFavorites = favorites.filter((favorite) => {
        const matchesSearch = [favorite.name, favorite.notes]
            .join(' ')
            .toLowerCase()
            .includes(searchTerm);
        const matchesCategory = selectedCategory === 'all'
            || favorite.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    favoritesList.innerHTML = '';

    if (visibleFavorites.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = favorites.length === 0
            ? 'No favorites yet. Add your first favorite place above!'
            : 'No favorites match your search.';
        favoritesList.appendChild(emptyMessage);
        return;
    }

    visibleFavorites.forEach((favorite) => {
        favoritesList.innerHTML += `
            <article class="favorite-card">
                <h3>${escapeHtml(favorite.name)}</h3>
                <span class="favorite-category">${escapeHtml(favorite.category)}</span>
                <div class="favorite-rating">${'★'.repeat(Number(favorite.rating))}${'☆'.repeat(5 - Number(favorite.rating))}</div>
                <p class="favorite-notes">${escapeHtml(favorite.notes || 'No notes added.')}</p>
                <small>Added: ${escapeHtml(favorite.dateAdded)}</small>
                <button type="button" class="delete-button" data-id="${favorite.id}">Remove</button>
            </article>`;
    });
}

form.addEventListener('submit', addFavorite);
searchInput.addEventListener('input', displayFavorites);
categoryFilter.addEventListener('change', displayFavorites);

favoritesList.addEventListener('click', (event) => {
    if (!event.target.matches('.delete-button')) {
        return;
    }

    favorites = favorites.filter((favorite) => favorite.id !== event.target.dataset.id);
    saveFavorites();
    displayFavorites();
});

displayFavorites();