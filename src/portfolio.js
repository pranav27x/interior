const rawImages = import.meta.glob('../assests/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, import: 'default' });

const portfolioData = {
  living: {
    title: "Living Room",
    desc: "Thoughtfully designed living spaces that balance comfort, functionality, and character.",
    images: []
  },
  bedroom: {
    title: "Bedroom",
    desc: "Serene, elegant retreats designed for ultimate relaxation and personal expression.",
    images: []
  },
  kitchen: {
    title: "Kitchen",
    desc: "Modern culinary spaces combining sleek aesthetics with smart, practical storage.",
    images: []
  },
  wardrobe: {
    title: "Wardrobe",
    desc: "Custom modular designs that maximize storage space without compromising on style.",
    images: []
  },
  balcony: {
    title: "Balcony",
    desc: "Outdoor extensions transformed into cozy, refreshing nooks for urban living.",
    images: []
  },
  washroom: {
    title: "Washroom",
    desc: "Premium washrooms designed with high-quality finishes for a spa-like experience.",
    images: []
  }
};

const folderToCategory = {
  'living': 'living',
  'bedroom': 'bedroom',
  'kitchen': 'kitchen',
  'wardrobe': 'wardrobe',
  'balcony': 'balcony',
  'washroom': 'washroom'
};

for (const path in rawImages) {
  const url = rawImages[path];
  const match = path.match(/\.\.\/assests\/([^\/]+)\//i);
  if (match) {
    const folderName = match[1].toLowerCase();
    const categoryKey = folderToCategory[folderName];
    if (categoryKey && portfolioData[categoryKey]) {
      portfolioData[categoryKey].images.push(url);
    }
  }
}


let currentCategory = 'living';
let currentImageIndex = 0;

// DOM Elements
const categoryNav = document.getElementById('category-nav');
const categoryBtns = document.querySelectorAll('.category-btn');
const categoryTitle = document.getElementById('active-category-title');
const categoryDesc = document.getElementById('active-category-desc');
const galleryGrid = document.getElementById('gallery-grid');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCloseBtn = document.getElementById('lightbox-close');
const lightboxPrevBtn = document.getElementById('lightbox-prev');
const lightboxNextBtn = document.getElementById('lightbox-next');

// Initialization
function initGallery() {
  renderCategory(currentCategory);

  // Category switching
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.target.dataset.category;
      if (category !== currentCategory) {
        // Update active class
        categoryBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        currentCategory = category;
        
        // Fade out transition
        galleryGrid.classList.add('fade-out');
        categoryTitle.style.opacity = '0';
        categoryDesc.style.opacity = '0';
        
        setTimeout(() => {
          renderCategory(currentCategory);
          
          galleryGrid.classList.remove('fade-out');
          categoryTitle.style.opacity = '1';
          categoryDesc.style.opacity = '1';
        }, 400); // Wait for CSS transition
      }
    });
  });

  // Lightbox Events
  lightboxCloseBtn.addEventListener('click', closeLightbox);
  lightboxPrevBtn.addEventListener('click', prevImage);
  lightboxNextBtn.addEventListener('click', nextImage);
  
  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });
}

function renderCategory(category) {
  const data = portfolioData[category];
  
  // Update Header
  categoryTitle.textContent = data.title;
  categoryDesc.textContent = data.desc;
  
  // Render Images
  galleryGrid.innerHTML = '';
  
  data.images.forEach((imgSrc, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = `${data.title} Project ${index + 1}`;
    img.className = 'gallery-img';
    img.loading = 'lazy'; // Important for performance
    
    item.appendChild(img);
    
    item.addEventListener('click', () => openLightbox(index));
    
    galleryGrid.appendChild(item);
  });
}

function openLightbox(index) {
  currentImageIndex = index;
  updateLightboxImage();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function updateLightboxImage() {
  const images = portfolioData[currentCategory].images;
  lightboxImg.src = images[currentImageIndex];
}

function prevImage() {
  const images = portfolioData[currentCategory].images;
  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  updateLightboxImage();
}

function nextImage() {
  const images = portfolioData[currentCategory].images;
  currentImageIndex = (currentImageIndex + 1) % images.length;
  updateLightboxImage();
}

// Start
document.addEventListener('DOMContentLoaded', initGallery);
