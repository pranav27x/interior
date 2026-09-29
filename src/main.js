// Initialize Lucide icons
lucide.createIcons();

// Update copyright year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
  });

  // Close menu when clicking a link
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
    });
  });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Services Entrance Animation
const servicesGrid = document.querySelector('.services-grid');
if (servicesGrid) {
  const cards = servicesGrid.querySelectorAll('.service-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('is-visible');
          }, index * 100);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  observer.observe(servicesGrid);
}

// Process Journey Animation
function initProcessAnimation() {
  const container = document.querySelector('.process-journey');
  const path = document.querySelector('.process-path-line');
  const spark = document.querySelector('.spark-particle');
  const nodes = document.querySelectorAll('.node-point');
  const cards = document.querySelectorAll('.process-card');
  
  if (!container || !path || !spark || nodes.length === 0) return;
  
  let pathLength = 0;
  
  function drawPath() {
    const containerRect = container.getBoundingClientRect();
    let d = '';
    const points = [];
    
    nodes.forEach(node => {
      const rect = node.getBoundingClientRect();
      points.push({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2
      });
    });
    
    if (points.length > 0) {
      d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i+1];
        
        // Control points for a vertical S-curve
        const cp1x = p1.x;
        const cp1y = p1.y + (p2.y - p1.y) / 2;
        const cp2x = p2.x;
        const cp2y = p1.y + (p2.y - p1.y) / 2;
        
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
    }
    
    path.setAttribute('d', d);
    pathLength = path.getTotalLength();
  }
  
  // Initial draw
  drawPath();
  // Small delay to ensure layout is complete, then redraw
  setTimeout(drawPath, 100);
  
  window.addEventListener('resize', () => {
    requestAnimationFrame(drawPath);
  });
  
  let isTicking = false;
  
  function updateScroll() {
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress relative to the viewport
    // Start when the top of the container is at 60% of viewport height
    // End when the bottom of the container (minus a bit) is at 40% of viewport height
    const startY = windowHeight * 0.7;
    const endY = windowHeight * 0.3;
    
    // total scroll distance for the effect
    const scrollDistance = rect.height + (startY - endY);
    // current scrolled distance
    const scrolled = startY - rect.top;
    
    let progress = scrolled / scrollDistance;
    progress = Math.max(0, Math.min(1, progress));
    
    if (progress > 0 && progress < 1) {
      spark.classList.add('visible');
    } else if (progress === 1) {
      spark.classList.add('visible');
    } else {
      spark.classList.remove('visible');
    }
    
    if (pathLength > 0) {
      const point = path.getPointAtLength(progress * pathLength);
      spark.style.transform = `translate(calc(${point.x}px - 50%), calc(${point.y}px - 50%))`;
      
      const step = 1 / (cards.length - 1);
      cards.forEach((card, index) => {
        const cardProgress = index * step;
        // give a slight buffer so it activates just before spark arrives
        if (progress >= cardProgress - 0.15) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }
    
    isTicking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(updateScroll);
      isTicking = true;
    }
  }, { passive: true });
  
  // Initial check
  updateScroll();
}

// Initialize on load
initProcessAnimation();

// Hero Carousel Animation
function initHeroCarousel() {
  const container = document.getElementById('carousel-images-container');
  const indicatorsContainer = document.getElementById('carousel-indicators');
  
  if (!container || !indicatorsContainer) return;
  
  const imageModules = import.meta.glob('/coursel/*.{jpg,jpeg,png,webp,svg}', { eager: true });
  let imageUrls = Object.values(imageModules).map(module => module.default || module);
  
  if (imageUrls.length === 0) {
    imageUrls = ['/hero.png'];
  }
  
  let currentIndex = 0;
  let intervalId = null;
  const slideDuration = 4500;
  
  imageUrls.forEach((url, index) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = `Modern elegant interior ${index + 1}`;
    img.className = `hero-image ${index === 0 ? 'active' : ''}`;
    container.appendChild(img);
    
    const dot = document.createElement('button');
    dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetAutoPlay();
    });
    indicatorsContainer.appendChild(dot);
  });
  
  const images = container.querySelectorAll('.hero-image');
  const dots = indicatorsContainer.querySelectorAll('.carousel-dot');
  
  if (imageUrls.length <= 1) {
    indicatorsContainer.style.display = 'none';
    return;
  }
  
  function goToSlide(index) {
    images[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');
    
    currentIndex = (index + images.length) % images.length;
    
    images[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
  }
  
  function nextSlide() {
    goToSlide(currentIndex + 1);
  }
  
  function prevSlide() {
    goToSlide(currentIndex - 1);
  }
  
  function startAutoPlay() {
    if (!intervalId) {
      intervalId = setInterval(nextSlide, slideDuration);
    }
  }
  
  function stopAutoPlay() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
  
  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }
  
  const carouselWrapper = document.getElementById('hero-carousel');
  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
    carouselWrapper.addEventListener('mouseleave', startAutoPlay);
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    carouselWrapper.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });
    
    carouselWrapper.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 50;
      if (touchEndX < touchStartX - swipeThreshold) {
        nextSlide();
        resetAutoPlay();
      } else if (touchEndX > touchStartX + swipeThreshold) {
        prevSlide();
        resetAutoPlay();
      } else {
        startAutoPlay();
      }
    }, { passive: true });
  }
  
  startAutoPlay();
}

initHeroCarousel();

// Hero Parallax Background
function initHeroParallax() {
  const heroSection = document.getElementById('home');
  const bgElements = document.getElementById('hero-bg-elements');
  
  if (!heroSection || !bgElements) return;
  
  const ghostText = bgElements.querySelector('.ghost-text');
  const archLines = bgElements.querySelector('.arch-lines');
  const labels = bgElements.querySelectorAll('.arch-label, .arch-measure');
  
  let isMobile = window.matchMedia('(max-width: 768px)').matches;
  window.addEventListener('resize', () => {
    isMobile = window.matchMedia('(max-width: 768px)').matches;
  });

  heroSection.addEventListener('mousemove', (e) => {
    if (isMobile) return;
    
    // Calculate mouse position relative to center of screen
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;
    
    requestAnimationFrame(() => {
      // Very subtle movement
      if (ghostText) {
        ghostText.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
      }
      if (archLines) {
        archLines.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
      }
      
      labels.forEach((label, i) => {
        // Alternate directions and amounts for depth
        const factorX = (i % 2 === 0) ? 8 : -6;
        const factorY = (i % 3 === 0) ? -8 : 6;
        label.style.setProperty('--px', `${x * factorX}px`);
        label.style.setProperty('--py', `${y * factorY}px`);
      });
    });
  });
}

initHeroParallax();
