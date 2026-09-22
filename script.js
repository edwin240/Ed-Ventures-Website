// Mobile navigation menu.
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

menuToggle.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen);
  menuToggle.textContent = isOpen ? 'Close' : 'Menu';
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = 'Menu';
  });
});

// Reveal sections as they enter the viewport.
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

// Filter cards on catalog pages by their data-category value.
const filterButtons = document.querySelectorAll('.filter-button');
const catalogCards = document.querySelectorAll('.catalog-card');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    catalogCards.forEach((card) => {
      card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

// Legacy modal behavior for any older catalog cards that still use details-trigger.
const detailButtons = document.querySelectorAll('.details-trigger');

if (detailButtons.length) {
  const modal = document.createElement('div');
  modal.className = 'detail-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = '<div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" aria-label="Close details">×</button><img class="modal-image" alt=""><div class="modal-copy"><p class="eyebrow">Details</p><h2 id="modal-title"></h2><p class="modal-price"></p><p class="modal-description"></p><p class="modal-specs"></p><a class="button button-dark" href="mailto:hello@edwinarevalo.com">Ask about this</a></div></div>';
  document.body.appendChild(modal);
  const closeModal = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); };

  detailButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.catalog-card');
      modal.querySelector('.modal-image').src = card.querySelector('img').src;
      modal.querySelector('.modal-image').alt = card.querySelector('img').alt;
      modal.querySelector('#modal-title').textContent = card.dataset.title;
      modal.querySelector('.modal-price').textContent = card.dataset.price;
      modal.querySelector('.modal-description').textContent = card.dataset.description;
      modal.querySelector('.modal-specs').textContent = card.dataset.specs;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
}

// Shared catalog data.
// Each item follows this structure:
// [category, title, price, description, dimensionsOrScope, imageSet, catalogLabel]
const items = {
  //FURNITURE LIBRARY//
  'cherry-dining-table': ['Furniture', 'River Dining Table', '$14,400', 'A statement dining table shaped from rich cherry with a natural live edge and a dark resin river. Built for long dinners and everyday life.', '72 in L × 36 in W × 30 in H', 'Aneja_Dining_Table', 'Cherry · Dining'],
  'waterfall-coffee-table': ['Furniture', 'Waterfall Coffee Table', '$3,650', 'A low-profile live edge coffee table that brings the grain and character of the slab into focus. Finished with durable natural oil.', '48 in L × 24 in W × 18 in H', 'Aneja_Coffee_Table', 'Cherry · Living room'],
  'poplar-desk': ['Furniture', 'Live Edge Computer Desk', '$2,150', 'A quiet, versatile bench with softened edges and a durable finish. Perfect at the foot of a bed, in an entryway, or around a dining table.', '60 in L × 14 in W × 18 in H', 'Poplar_Desk', 'Poplar · Office'],
  'walnut-computer-desk': ['Furniture', 'Walnut Live Edge Computer Desk', '$3,050', 'A warm, rounded coffee table designed to move easily through a room. The wide top shows off the walnut’s natural movement.', '36 in diameter × 18 in H', 'Walnut_Computer_Desk', 'Walnut · Office'],
  'infinity-coffee-table': ['Furniture', '"Infinity" Coffee Table', '$3,000', 'A compact solid-oak stool with a sculpted seat and a hand-rubbed finish. A useful small piece with a strong presence.', '18 in W × 18 in D × 20 in H', 'Infinity_Coffee_Table', 'Olivewood · Living Room'],
  'maple-console-table': ['Furniture', 'Maple Console Table', '$1,150', 'A slim console table with a clean silhouette and a broad maple top. Designed for hallways, studios, and thoughtful display.', '54 in L × 14 in W × 30 in H', 'furniture', 'Maple · Entryway'],
  //PHOTOGRAPHY LIBRARY// 
  'corporate-headshots': ['Photography', 'Corporate Headshots', 'From $200', 'Polished, relaxed headshots for teams, founders, and professionals. Includes planning, a focused studio or on-location session, and edited final images.', '60–90 minute session · 8 edited images', 'Headshots', 'People · Professional'],
  'engagement-session': ['Photography', 'Engagement Session', 'From $300', 'A relaxed outdoor session that captures your connection without forcing the moment. We will plan a location and simple visual direction together.', '90 minute session · ~35 edited images', 'Engagement', 'People · Couples'],
  'birthday-shoot': ['Photography', 'Birthday Shoot', 'From $300', 'A bright, expressive shoot for birthdays and milestones. Bring your people, your outfit changes, and the energy that makes the day yours.', '90 minute session · 30 edited images', 'people', 'People · Celebration'],
  'branding-business': ['Photography', 'Branding & Business', 'From $500', 'A visual library for your business: portraits, workspace details, products, and the small moments that make your brand feel real.', '2 hour session · 50 edited images', 'business', 'Business · Storytelling'],
  'product-photography': ['Photography', 'Product Photography', 'From $300', 'Clean, tactile product imagery made for websites, launches, social media, and catalogs. We will shape a shot list around your needs.', 'Up to 8 products · 20 edited images', 'business', 'Business · Products'],
  'real-estate-story': ['Photography', 'Real Estate Story', 'From $200', 'Warm, accurate images that help a property feel like a place. Built for listings, rentals, and spaces that deserve attention.', 'Up to 2,000 sq ft · 25 edited images', 'business', 'Business · Spaces'],
  'creative-direction': ['Other Work', 'Creative Direction', 'From $750', 'Shape the visual direction of a launch, campaign, or personal project. Includes concept development, references, and a practical creative plan.', 'Half-day direction · Concept deck · One revision', 'creative', 'Creative · Strategy'],
  'custom-art-piece': ['Other Work', 'Custom Art Piece', 'From $600', 'A one-off handmade object built around your space, story, or idea. We will develop the material, scale, and finish together.', 'Custom scope · 4–8 week lead time', 'creative', 'Creative · Object'],
  'space-styling': ['Other Work', 'Space Styling', 'From $900', 'Thoughtful styling for a room, studio, or small commercial space. We focus on materials, placement, light, and the feeling people take away.', 'One room · Styling plan · Sourcing list', 'spaces', 'Spaces · Interiors'],
  'brand-story-package': ['Other Work', 'Brand Story Package', 'From $1,200', 'A compact visual story for an emerging brand, combining creative direction, photography, and a set of launch-ready assets.', 'Strategy call · Shoot day · 40 edited assets', 'creative', 'Creative · Brand'],
  'workshop-experience': ['Other Work', 'Workshop Experience', '$175 per person', 'A small-group introduction to making with wood. Guests learn the basics, make a useful object, and leave with something made by hand.', '2.5 hours · Groups of 4–8', 'spaces', 'Spaces · Learning'],
  'collaboration-session': ['Other Work', 'Collaboration Session', 'From $450', 'A focused working session for artists, makers, and entrepreneurs who want a second set of eyes and a thoughtful creative partner.', '3 hour session · Follow-up notes', 'creative', 'Creative · Consulting'],
  // Other Work //
  'picnic-table': ['Other Work', 'Picnic Table', 'Contact for pricing', 'A handcrafted outdoor table designed for gathering, shared meals, and time spent outside. Contact me for available finishes, dimensions, and delivery details.', 'Custom dimensions available', 'Picnic_Table', 'Outdoor · Furniture'],
  'red-oak-dresser': ['Other Work', 'Red Oak Dressers', 'Contact for pricing', 'A warm red-oak dresser made to bring practical storage and lasting character to a room. Contact me for dimensions, finish options, and availability.', 'Custom dimensions available', 'Red_Oak_Dresser', 'Red oak · Storage']
};

// Keep previous URLs working after product slugs were renamed.
items['walnut-dining-table'] = items['cherry-dining-table'];
items['live-edge-coffee-table'] = items['waterfall-coffee-table'];

// Change this list to control which products appear on the landing page.
// Each entry needs an item ID from the shared items object and an image path.
const featuredFurniture = [
  { itemId: 'infinity-coffee-table', image: 'images/Furniture/Infinity Coffee Table/Infinity_Coffee_Table-1.avif', alt: 'Infinity coffee table' },
  { itemId: 'cherry-dining-table', image: 'images/Furniture/Aneja Dining Table/Aneja_Dining_Table-1.avif', alt: 'Cherry river dining table' },
  { itemId: 'waterfall-coffee-table', image: 'images/Furniture/Aneja Coffee Table/Aneja_Coffee_Table-1.avif', alt: 'Waterfall coffee table' },
  { itemId: 'poplar-desk', image: 'images/Furniture/Poplar Desk/Poplar_Desk-1.avif', alt: 'Poplar live edge computer desk' }
];

const featuredGrid = document.querySelector('#featured-grid');

if (featuredGrid) {
  featuredGrid.innerHTML = featuredFurniture.map(({ itemId, image, alt }) => {
    const item = items[itemId];
    if (!item) return '';
    return `<article class="product reveal"><img src="${image}" alt="${alt}"><h3>${item[1]}</h3><p>${item[2]}</p><small>${item[4]}</small><a class="button button-dark" href="detail.html?item=${itemId}">View details</a></article>`;
  }).join('');
  featuredGrid.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

// Populate catalog titles, labels, and prices from the shared item data above.
document.querySelectorAll('.catalog-card').forEach((card) => {
  const itemId = card.dataset.item || card.querySelector('a[href*="item="]')?.href.split('item=')[1];
  const item = items[itemId];
  if (!item) return;
  card.querySelector('h3').textContent = item[1];
  card.querySelector('.card-info p').textContent = item[6] || item[0];
  card.querySelector('.card-info strong').textContent = item[2];
  const detailLink = card.querySelector('a[href*="item="]');
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'link');
  card.addEventListener('click', (event) => {
    if (!event.target.closest('a')) window.location.href = detailLink.href;
  });
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.location.href = detailLink.href;
    }
  });
});

// Detail-page gallery. This block only runs when detail.html is open.
const detailImage = document.querySelector('#detail-image');

if (detailImage) {
  (async () => {
  // Remote fallback galleries remain available for items without local folders.
  const imageSets = {
    furniture: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=90'
    ],
    // FURNITURE..//
    Aneja_Dining_Table: 'images/Furniture/Aneja Dining Table/images.json',
    Aneja_Coffee_Table: 'images/Furniture/Aneja Coffee Table/images.json',
    Poplar_Desk: 'images/Furniture/Poplar Desk/images.json',
    Infinity_Coffee_Table: 'images/Furniture/Infinity Coffee Table/images.json',
    Walnut_Computer_Desk: 'images/Furniture/Walnut Computer Desk/images.json',

    // PHOTOGRAPHY..//
    Headshots: 'images/Photography/Headshots/images.json',
    Engagement: 'images/Photography/Engagement/images.json',

    // OTHER WORK..// 
    Picnic_Table: 'images/Other Work/Picnic Table/images.json',
    Red_Oak_Dresser: 'images/Other Work/Red Oak Dresser/images.json',


    people: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=90'
    ],
    business: [
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=90'
    ],
    creative: [
      'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1400&q=90'
    ],
    spaces: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=90',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=90'
    ]
  };
  // Read the selected product from detail.html?item=product-slug.
  const itemId = new URLSearchParams(window.location.search).get('item');
  const item = items[itemId] || items['cherry-dining-table'];
  const imageSetSource = imageSets[item[5]];
  // A manifest stores filenames relative to its own folder, so add that folder path here.
  const imageSet = typeof imageSetSource === 'string'
    ? await fetch(imageSetSource).then((response) => {
      if (!response.ok) throw new Error(`Could not load ${imageSetSource}`);
      return response.json();
    })
    : imageSetSource;
  if (imageSet.full && imageSet.thumbs) {
    const manifestFolder = imageSetSource.substring(0, imageSetSource.lastIndexOf('/') + 1);
    imageSet.full = imageSet.full.map((filename) => `${manifestFolder}${filename}`);
    imageSet.thumbs = imageSet.thumbs.map((filename) => `${manifestFolder}${filename}`);
  }
  const images = Array.isArray(imageSet) ? imageSet : imageSet.full;
  const thumbnails = Array.isArray(imageSet) ? imageSet : imageSet.thumbs;
  let currentImage = 0;
  document.title = `${item[1]} | Edwin Arevalo`;
  document.querySelector('#detail-kicker').textContent = item[0];
  document.querySelector('#detail-title').textContent = item[1];
  document.querySelector('#detail-price').textContent = item[2];
  document.querySelector('#detail-description').textContent = item[3];
  document.querySelector('#detail-specs').textContent = item[4];
  document.querySelector('#back-link').href = item[0] === 'Furniture' ? 'furniture.html' : item[0] === 'Photography' ? 'photography.html' : 'other-work.html';
  const imageElement = document.querySelector('#detail-image');
  const galleryTrack = document.querySelector('#gallery-track');
  const countElement = document.querySelector('#gallery-count');
  const thumbsElement = document.querySelector('#gallery-thumbs');
  const slideElements = images.map((image, index) => {
    const slide = index === 0 ? imageElement : document.createElement('img');
    slide.className = 'gallery-slide';
    slide.src = image;
    slide.alt = `${item[1]} image ${index + 1}`;
    slide.loading = index === 0 ? 'eager' : 'lazy';
    if (index > 0) galleryTrack.appendChild(slide);
    return slide;
  });
  const syncImageOrientation = () => {
    const activeImage = slideElements[currentImage];
    const { naturalWidth, naturalHeight } = activeImage;
    if (!naturalWidth || !naturalHeight) return;
    const isLandscape = naturalWidth >= naturalHeight;
    activeImage.classList.toggle('is-landscape', isLandscape);
    activeImage.classList.toggle('is-portrait', !isLandscape);
  };
  const updateGalleryPosition = (animate = true) => {
    galleryTrack.style.transition = animate ? 'transform .42s cubic-bezier(.22,.61,.36,1)' : 'none';
    galleryTrack.style.transform = `translate3d(${-currentImage * 100}%, 0, 0)`;
  };
  // Change the active slide and keep the count and thumbnail state in sync.
  const showImage = (index, animate = true) => {
    currentImage = (index + images.length) % images.length;
    slideElements[currentImage].onload = syncImageOrientation;
    countElement.textContent = `${currentImage + 1} / ${images.length}`;
    thumbsElement.querySelectorAll('button').forEach((thumb, thumbIndex) => thumb.classList.toggle('active', thumbIndex === currentImage));
    updateGalleryPosition(animate);
    if (slideElements[currentImage].complete) syncImageOrientation();
  };
  thumbnails.forEach((thumbnail, index) => { const thumb = document.createElement('button'); thumb.type = 'button'; thumb.setAttribute('aria-label', `Show image ${index + 1}`); thumb.innerHTML = `<img src="${thumbnail}" alt="" loading="eager">`; thumb.addEventListener('mouseenter', () => showImage(index)); thumb.addEventListener('focus', () => showImage(index)); thumb.addEventListener('click', () => showImage(index)); thumbsElement.appendChild(thumb); });
  document.querySelector('.gallery-prev').addEventListener('click', () => showImage(currentImage - 1));
  document.querySelector('.gallery-next').addEventListener('click', () => showImage(currentImage + 1));
  // Drag the slide track directly, allowing a long swipe to pass multiple images.
  const galleryMain = document.querySelector('.gallery-main');
  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipeDeltaX = 0;
  let isDragging = false;
  galleryMain.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.target.closest('button')) return;
    swipeStartX = event.clientX;
    swipeStartY = event.clientY;
    swipeDeltaX = 0;
    isDragging = true;
    try {
      galleryMain.setPointerCapture(event.pointerId);
    } catch (error) {
      // Some synthetic events do not have an active pointer to capture.
    }
    galleryTrack.style.transition = 'none';
  });
  galleryMain.addEventListener('pointermove', (event) => {
    if (!isDragging) return;
    const deltaY = event.clientY - swipeStartY;
    swipeDeltaX = event.clientX - swipeStartX;
    if (Math.abs(swipeDeltaX) <= Math.abs(deltaY)) return;
    event.preventDefault();
    const resistance = (currentImage === 0 && swipeDeltaX > 0) || (currentImage === images.length - 1 && swipeDeltaX < 0) ? 0.35 : 1;
    galleryTrack.style.transform = `translate3d(calc(${-currentImage * 100}% + ${swipeDeltaX * resistance}px), 0, 0)`;
  });
  const finishSwipe = (event) => {
    if (!isDragging) return;
    isDragging = false;
    if (galleryMain.hasPointerCapture(event.pointerId)) galleryMain.releasePointerCapture(event.pointerId);
    const skippedImages = Math.abs(swipeDeltaX) < 45 ? 0 : Math.max(1, Math.round(Math.abs(swipeDeltaX) / galleryMain.clientWidth));
    showImage(currentImage + (swipeDeltaX < 0 ? skippedImages : -skippedImages));
  };
  galleryMain.addEventListener('pointerup', finishSwipe);
  galleryMain.addEventListener('pointercancel', finishSwipe);
  // Turn the mouse wheel into horizontal thumbnail scrolling.
  thumbsElement.addEventListener('wheel', (event) => {
    if (thumbsElement.scrollWidth <= thumbsElement.clientWidth) return;
    event.preventDefault();
    thumbsElement.scrollLeft += event.deltaY || event.deltaX;
  }, { passive: false });
  showImage(0);
  })().catch((error) => console.error('Could not load detail gallery:', error));
}

//ssdds //