document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const welcomeSection = document.getElementById("welcome-section");
  const appList = document.getElementById("app-list");
  const robotImage = document.getElementById("robot-image");
  const scrollContainer = document.getElementById("scroll-container");
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content');
  const closeModal = document.getElementById('close-modal');
  const closeModalMobile = document.getElementById('close-modal-mobile');
  const modalImage = document.getElementById('modal-image');
  const modalName = document.getElementById('modal-name');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalDescription = document.getElementById('modal-description');
  const modalCategory = document.getElementById('modal-category');
  const modalRating = document.getElementById('modal-rating');
  const modalPrice = document.getElementById('modal-price');
  const modalAccessories = document.getElementById('modal-accessories');
  const modalOptimusButton = document.getElementById('optimus-button');
  const modalNeuralinkButton = document.getElementById('neuralink-button');
  const neuralinkOverlay = document.getElementById('neuralink-overlay');
  const neuralinkAnimation = document.getElementById('neuralink-animation');   
  const installMessage = document.getElementById('neuralink-install-message');
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

    // Randomly assign clockwise or counterclockwise animation
    const animationType = Math.random() > 0.5 ? 'swirl-clockwise' : 'swirl-counterclockwise';
    glowingAnimation.style.animationName = animationType;    

    welcomeSection.appendChild(glowingAnimation);
  }

  function createMultipleGlowingAnimations(count) {
    const top = 30; // Fixed top position
    const left = 48; // Fixed left position
    for (let i = 0; i < count; i++) {
      createGlowingAnimation(top, left);
    }
  }

  function startAnimation() {
    if (!animationComplete) {
        animationComplete = true;
        welcomeSection.remove(); // Remove the welcome-section from the DOM
        appList.classList.remove('hidden');
        header.classList.remove('hidden');
        scrollContainer.style.height = '100vh'; // Adjust the height of the scroll-container
        window.scrollTo(0, 0); // Scroll back to the top
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
      startAnimation();
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
    if(app.neuralink) {
      modalNeuralinkButton.classList.remove('hidden');
      modalNeuralinkButton.classList.add('show');
    }
    modal.classList.remove('hidden');
}

function startNeuralinkAnimation() {
  neuralinkOverlay.classList.remove('hidden');
  neuralinkOverlay.classList.add('show');
  installMessage.classList.remove('hidden');
  installMessage.classList.add('show');

  // Create glowing circles
  for (let i = 0; i < 5; i++) {
      const circle = document.createElement('div');
      circle.className = 'glowing-circle';
      circle.style.animationDelay = `${i * 0.5}s`;
      neuralinkAnimation.appendChild(circle);
  }

    // Hide the overlay and remove the glowing circles after 5 seconds
    setTimeout(() => {
      neuralinkOverlay.classList.remove('show');
      neuralinkOverlay.classList.add('hidden');
      neuralinkAnimation.innerHTML = '';
      installMessage.classList.remove('show');
      installMessage.classList.add('hidden');
  }, 4000);
}

  window.addEventListener("scroll", updateAnimationProgress);
  welcomeSection.addEventListener('click', startAnimation);

  const neuralinkSVG = `<svg class="neuralinkIcon" width="56" height="35" viewBox="0 0 56 35" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#e6e5e5" fill-rule="evenodd" clip-rule="evenodd" d="M30.8777 22.4886H0.705078L22.5011 2.28693C24.3585 0.565492 27.0293 -0.000275522 29.47 0.809903C31.9102 1.62058 33.6439 3.6498 33.994 6.10498L37.476 30.5019C37.5803 31.2306 38.0767 31.8049 38.8036 32.0367C39.5305 32.2696 40.2868 32.0946 40.8255 31.572L50.1712 22.4886H39.4676L39.1096 20.2688H55.7051L42.4717 33.131C41.6499 33.9302 40.5593 34.3566 39.4367 34.3566C38.9823 34.3566 38.5221 34.2862 38.073 34.1429C36.5143 33.6455 35.4074 32.3656 35.1842 30.8031L31.7021 6.40672C31.4673 4.75921 30.3499 3.45166 28.7127 2.90802C27.0759 2.36337 25.3548 2.72899 24.108 3.88365L6.42923 20.2688H30.5522L30.8777 22.4886Z"></path></svg>`

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
                    ${app.neuralink ? neuralinkSVG : ''}
                `;
        appCard.addEventListener('click', () => {openModal(app)});
        appList.appendChild(appCard);
      });
    });

  modalNeuralinkButton.addEventListener('click', startNeuralinkAnimation);

  closeModal.addEventListener('click', () => {
      modal.classList.add('hidden');
      modalNeuralinkButton.classList.remove('show');
    modalNeuralinkButton.classList.add('hidden');
  });

  closeModalMobile.addEventListener('click', () => {
    modal.classList.add('hidden');
    modalNeuralinkButton.classList.remove('show');
    modalNeuralinkButton.classList.add('hidden');
  });

  // Create multiple glowing animations
  createMultipleGlowingAnimations(6); // Adjust the number of animations as needed
});
