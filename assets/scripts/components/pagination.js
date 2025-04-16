export function createPagination({ container, currentPage, totalPages, onPageChange }) {
    container.innerHTML = '';
    totalPages = Math.min(totalPages, 500);

    function createButton(page, isActive = false) {
        const btn = document.createElement('button');
        btn.textContent = page;
        btn.className = `pagination-btn mx-1 px-3 py-1 rounded ${
            isActive ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`;
        btn.disabled = isActive;
        btn.addEventListener('click', () => onPageChange(page));
        return btn;
    }

    // Première page
    container.appendChild(createButton(1, currentPage === 1));

    // Points de suspension après première page
    if (currentPage > 3) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        dots.className = 'mx-2 text-gray-400';
        container.appendChild(dots);
    }

    // Pages autour de la page actuelle
    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    for (let i = startPage; i <= endPage; i++) {
        container.appendChild(createButton(i, i === currentPage));
    }

    // Points de suspension avant dernière page
    if (currentPage < totalPages - 2) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        dots.className = 'mx-2 text-gray-400';
        container.appendChild(dots);
    }

    // Dernière page
    if (totalPages > 1) {
        container.appendChild(createButton(totalPages, currentPage === totalPages));
    }
}
