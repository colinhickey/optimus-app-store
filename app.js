document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const appList = document.getElementById('app-list');
            data.apps.forEach(app => {
                const appCard = document.createElement('div');
                appCard.className = 'app-card';
                appCard.innerHTML = `
                    <img src="${app.image}" alt="${app.name}">
                    <h2>${app.name}</h2>
                    <p>${app.description}</p>
                `;
                appList.appendChild(appCard);
            });
        });
});