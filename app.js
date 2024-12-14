document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const welcomeSection = document.getElementById("welcome-section");
  const appList = document.getElementById("app-list");
  const robotImage = document.getElementById("robot-image");
  const scrollContainer = document.getElementById("scroll-container");
  const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const closeModal = document.getElementById('close-modal');
const modalImage = document.getElementById('modal-image');
const modalName = document.getElementById('modal-name');
const modalSubtitle = document.getElementById('modal-subtitle');
const modalDescription = document.getElementById('modal-description');
const modalCategory = document.getElementById('modal-category');
const modalRating = document.getElementById('modal-rating');
const modalPrice = document.getElementById('modal-price');
const modalAccessories = document.getElementById('modal-accessories');
  let animationComplete = false;

  function createGlowingAnimation(top, left) {
    const glowingAnimation = document.createElement("div");
    glowingAnimation.className = "glowing-animation";

    // Randomize properties
    const width = Math.random() * 100 + 200; // Random width between 200px and 300px
    const height = Math.random() * 100 + 50; // Random height between 50px and 150px
    const duration = Math.random() * 3 + 2; // Random duration between 2s and 5s
    const colors = [
      "rgba(255, 0, 255, 0.3)", // Purple
      "rgba(0, 0, 255, 0.3)", // Blue
      "rgba(255, 0, 0, 0.3)", // Red
    ];
    const color1 = colors[Math.floor(Math.random() * colors.length)];
    const color2 = colors[Math.floor(Math.random() * colors.length)];
    const color3 = colors[Math.floor(Math.random() * colors.length)];

    glowingAnimation.style.width = `${width}px`;
    glowingAnimation.style.height = `${height}px`;
    glowingAnimation.style.top = `${top}%`;
    glowingAnimation.style.left = `${left}%`;
    glowingAnimation.style.animationDuration = `${duration}s`;
    glowingAnimation.style.boxShadow = `
            inset 0 0 10px ${color1},
            inset 0 0 20px ${color2},
            inset 0 0 30px ${color3},
            0 0 10px ${color1},
            0 0 20px ${color2},
            0 0 30px ${color3}
        `;

    welcomeSection.appendChild(glowingAnimation);
  }

  function createMultipleGlowingAnimations(count) {
    const top = 30; // Fixed top position
    const left = 48; // Fixed left position
    for (let i = 0; i < count; i++) {
      createGlowingAnimation(top, left);
    }
  }

  function updateAnimationProgress() {
    const scrollTop = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollFraction = scrollTop / maxScroll;

    // Update the transform scale based on scroll progress
    const scaleValue = 1 + scrollFraction * 9; // Scale from 1 to 10
    robotImage.style.transform = `scale(${scaleValue})`;

    // Update the opacity of the glowing animation based on scroll progress
    const glowingAnimations = document.querySelectorAll(".glowing-animation");
    glowingAnimations.forEach((animation) => {
      animation.style.opacity = scrollFraction;
    });

    // Show or hide elements based on scroll progress
    if (scrollFraction >= 1 && !animationComplete) {
      animationComplete = true;
      welcomeSection.remove(); // Remove the welcome-section from the DOM
      appList.classList.remove("hidden");
      header.classList.remove("hidden");
      scrollContainer.style.height = "100vh"; // Adjust the height of the scroll-container
      window.scrollTo(0, 0); // Scroll back to the top
    } else if (!animationComplete) {
      welcomeSection.style.display = "flex";
      appList.classList.add("hidden");
      header.classList.add("hidden");
    }
  }

  function openModal(app) {
    modalImage.src = `images/${app.image}`;
    modalName.textContent = app.name;
    modalSubtitle.textContent = app.subtitle;
    modalDescription.textContent = app.description;
    modalCategory.innerHTML = `${app.category}`;
    modalRating.textContent = `${app.rating} ⭐`;
    modalPrice.textContent = `${app.price}`;
    modalAccessories.textContent = `Accessories: ${app?.accessories ?? 'None'}`;
    const appNeuralink = document.createElement("button");
    appNeuralink.id = "neuralink-button";
    appNeuralink.textContent = "Send to Neuralink";
    app.neuralink ? modalContent.appendChild(appNeuralink) : '';
    modal.classList.remove('hidden');
}

  window.addEventListener("scroll", updateAnimationProgress);

  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      data.apps.forEach((app) => {
        const appCard = document.createElement("div");
        appCard.className = "app-card";
        appCard.innerHTML = `
                    <img src="images/${app.image}" alt="${app.name}">
                    <h3>${app.name}</h3>
                    <p class="price">${app.price}</p>
                    <p class="subtitle">${app.subtitle}</p>
                    <p class="category">${app.category}</p>      
                    <p class="rating">${app.rating} ⭐</p>
                `;
        appCard.addEventListener('click', () => {
            openModal(app)
        });
        appList.appendChild(appCard);
      });
    });

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

  // Create multiple glowing animations
  createMultipleGlowingAnimations(6); // Adjust the number of animations as needed
});
