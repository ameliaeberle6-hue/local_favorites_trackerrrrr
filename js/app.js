const storageKey = 'local-favorites-tracker';
const favoriteForm = document.getElementById('add-favorite-form');
const favoritesList = document.getElementById('favorites-list');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

const starterFavorite = {
    id: 'starbucks-on-university-drive',
    name: 'Starbucks on University Drive',
    category: 'coffee',
    rating: 5,
    notes: 'Great study spot with fast wifi',
    dateAdded: new Date().toLocaleDateString()
};

let favorites = loadFavorites();

function loadFavorites() {
    try {
        const savedFavorites = localStorage.getItem(storageKey);
        if (savedFavorites === null) {
            const initialFavorites = [starterFavorite];
            localStorage.setItem(storageKey, JSON.stringify(initialFavorites));
            return initialFavorites;
        }

        return JSON.parse(savedFavorites);
    } catch (error) {
        return [];
    }
}

function saveFavorites() {
    localStorage.setItem(storageKey, JSON.stringify(favorites));
}

function renderFavorites() {
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
        const card = document.createElement('article');
        card.className = 'favorite-card';
        card.innerHTML = `
            <h3>${escapeHtml(favorite.name)}</h3>
            <p class="favorite-category">${escapeHtml(favorite.category)}</p>
            <p>${'★'.repeat(Number(favorite.rating))}${'☆'.repeat(5 - Number(favorite.rating))}</p>
            <p>${escapeHtml(favorite.notes || 'No notes added.')}</p>
            <small>Added ${escapeHtml(favorite.dateAdded)}</small>
            <button type="button" class="delete-button" data-id="${favorite.id}">Remove</button>
        `;
        favoritesList.appendChild(card);
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

favoriteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(favoriteForm);

    favorites.unshift({
        id: Date.now().toString(),
        name: formData.get('name').trim(),
        category: formData.get('category'),
        rating: Number(formData.get('rating')),
        notes: formData.get('notes').trim(),
        dateAdded: new Date().toLocaleDateString()
    });

    saveFavorites();
    favoriteForm.reset();
    renderFavorites();
});

favoritesList.addEventListener('click', (event) => {
    if (!event.target.matches('.delete-button')) {
        return;
    }

    favorites = favorites.filter((favorite) => favorite.id !== event.target.dataset.id);
    saveFavorites();
    renderFavorites();
});

searchInput.addEventListener('input', renderFavorites);
categoryFilter.addEventListener('change', renderFavorites);

renderFavorites();