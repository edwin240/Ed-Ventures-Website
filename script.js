// Site-wide behavior for Edwin Arevalo portfolio pages.
// Sections: navigation · scroll reveal · catalog filters · legacy modal ·
// product data · featured grid · catalog cards · detail-page gallery

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
// Wait one paint frame before revealing above-the-fold items so the CSS
// transition always has a hidden starting state (refresh + fast localhost loads).
let revealsEnabled = false;
const revealObserver = new IntersectionObserver((entries) => {
  if (!revealsEnabled) return;
  entries.forEach((entry) => {
    if (entry.isIntersecting) revealElement(entry.target);
  });
}, { threshold: 0.12 });

const revealElement = (element) => {
  if (element.classList.contains('visible')) return;
  element.classList.add('visible');
  revealObserver.unobserve(element);
};

const isInRevealViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
};

const registerRevealElements = (root = document) => {
  root.querySelectorAll('.reveal:not([data-reveal-tracked])').forEach((element) => {
    element.dataset.revealTracked = 'true';
    element.classList.remove('visible');
    revealObserver.observe(element);
    if (revealsEnabled && isInRevealViewport(element)) revealElement(element);
  });
};

const startRevealAnimations = () => {
  revealsEnabled = true;
  document.querySelectorAll('.reveal:not(.visible)').forEach((element) => {
    if (isInRevealViewport(element)) revealElement(element);
  });
};

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
  revealsEnabled = true;
} else {
  registerRevealElements();
  requestAnimationFrame(() => requestAnimationFrame(startRevealAnimations));
}

// Contact page (contact.html): swap the side image when interest changes.
const contactForm = document.querySelector('#contact-form');
const contactInterest = document.querySelector('#contact-interest');
const contactVisualImage = document.querySelector('#contact-visual-image');
const contactVisualCaption = document.querySelector('#contact-visual-caption');

if (contactInterest && contactVisualImage && contactVisualCaption) {
  const contactVisuals = {
    furniture: {
      src: 'images/Furniture/Aneja Dining Table/Aneja_Dining_Table-1.avif',
      alt: 'Custom live-edge dining table',
      caption: 'Furniture / Commissions & available pieces'
    },
    photography: {
      src: 'images/Photography/Headshots/Headshots-1.avif',
      alt: 'Professional headshot session',
      caption: 'Photography / Sessions & brand work'
    },
    other: {
      src: 'images/Other Work/Picnic Table/Picnic_Table-1.avif',
      alt: 'Handcrafted picnic table',
      caption: 'Other work / Custom projects'
    }
  };

  const updateContactVisual = () => {
    const visual = contactVisuals[contactInterest.value];
    if (!visual) return;
    contactVisualImage.style.opacity = '0';
    contactVisualImage.onload = () => { contactVisualImage.style.opacity = '1'; };
    contactVisualImage.src = visual.src;
    contactVisualImage.alt = visual.alt;
    contactVisualCaption.textContent = visual.caption;
    if (contactVisualImage.complete) contactVisualImage.style.opacity = '1';
  };

  contactInterest.addEventListener('change', updateContactVisual);
}

if (contactForm) {
  const contactSubmit = contactForm.querySelector('.contact-submit');
  const contactError = document.querySelector('#contact-form-error');
  const contactModal = document.querySelector('#contact-success-modal');
  const contactModalClose = contactModal?.querySelector('.contact-modal-close');
  const defaultSubmitLabel = contactSubmit?.innerHTML;
  const contactModalPanel = contactModal?.querySelector('.contact-modal-panel');
  let contactSubmitting = false;

  const buildContactFormData = () => {
    const interest = contactForm.querySelector('[name="interest"]');
    const interestLabel = interest?.options[interest.selectedIndex]?.text || 'Inquiry';
    const stamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    const formData = new FormData(contactForm);
    formData.set('subject', `New ${interestLabel} inquiry — ${stamp}`);
    formData.set('submission_id', globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    return formData;
  };

  const resetContactForm = () => {
    contactForm.reset();
    const botcheck = contactForm.querySelector('[name="botcheck"]');
    if (botcheck) botcheck.checked = false;
    if (contactInterest) contactInterest.dispatchEvent(new Event('change'));
  };

  const closeContactModal = () => {
    if (!contactModal) return;
    contactModal.hidden = true;
    contactModal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('mousedown', handleContactOutsideClick);
  };

  const handleContactOutsideClick = (event) => {
    if (!contactModalPanel || contactModal.hidden) return;
    if (!contactModalPanel.contains(event.target)) closeContactModal();
  };

  const openContactModal = () => {
    if (!contactModal) return;
    contactModal.hidden = false;
    contactModal.setAttribute('aria-hidden', 'false');
    document.addEventListener('mousedown', handleContactOutsideClick);
    contactModalClose?.focus();
  };

  contactModalClose?.addEventListener('click', closeContactModal);

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (contactSubmitting || !contactForm.reportValidity()) return;

    contactSubmitting = true;
    contactError.hidden = true;
    if (contactSubmit) {
      contactSubmit.disabled = true;
      contactSubmit.textContent = 'Sending…';
    }

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: buildContactFormData(),
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Submission failed');
      }
      resetContactForm();
      openContactModal();
    } catch (error) {
      contactError.hidden = false;
    } finally {
      contactSubmitting = false;
      if (contactSubmit) {
        contactSubmit.disabled = false;
        contactSubmit.innerHTML = defaultSubmitLabel;
      }
    }
  });
}

// Filter catalog cards by availability (furniture) or category (photography/other work).
const catalogCards = document.querySelectorAll('.catalog-card');
const availabilityFilterButtons = document.querySelectorAll('.filter-button[data-availability]');
const categoryFilterButtons = document.querySelectorAll('.filter-button[data-filter]');

if (availabilityFilterButtons.length) {
  availabilityFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      availabilityFilterButtons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.availability;
      catalogCards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.availability === filter;
        card.classList.toggle('is-hidden', !matches);
      });
    });
  });
} else if (categoryFilterButtons.length) {
  categoryFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      categoryFilterButtons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      catalogCards.forEach((card) => {
        card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.category !== filter);
      });
    });
  });
}

// Legacy modal behavior for any older catalog cards that still use details-trigger.
const detailButtons = document.querySelectorAll('.details-trigger');

if (detailButtons.length) {
  const modal = document.createElement('div');
  modal.className = 'detail-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = '<div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" aria-label="Close details">×</button><img class="modal-image" alt=""><div class="modal-copy"><p class="eyebrow">Details</p><h2 id="modal-title"></h2><p class="modal-price"></p><p class="modal-description"></p><p class="modal-specs"></p><a class="button button-dark" href="contact.html">Ask about this</a></div></div>';
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
// Each item: [status, category, title, price, dimensionsOrScope, imageSet, catalogLabel, description]
// status is 'available' or 'sold'
const ITEM = {
  STATUS: 0,
  CATEGORY: 1,
  TITLE: 2,
  PRICE: 3,
  SPECS: 4,
  IMAGE_SET: 5,
  LABEL: 6,
  DESCRIPTION: 7
};
const ITEM_STATUS = { SOLD: 'sold', AVAILABLE: 'available' };
const isSold = (item) => item[ITEM.STATUS] === ITEM_STATUS.SOLD;
const formatSoldPrice = (price) => `Sold · ${price}`;
const displayPrice = (item) => (isSold(item) ? formatSoldPrice(item[ITEM.PRICE]) : item[ITEM.PRICE]);

const ensureSoldBadge = (card) => {
  if (card.querySelector('.sold-badge')) return;
  const image = card.querySelector('img');
  if (!image) return;
  const badge = document.createElement('span');
  badge.className = 'sold-badge';
  badge.textContent = 'Sold';
  badge.hidden = true;
  image.insertAdjacentElement('afterend', badge);
};

const applySoldToCatalogCard = (card, item) => {
  card.dataset.availability = item[ITEM.STATUS];
  ensureSoldBadge(card);
  const badge = card.querySelector('.sold-badge');
  if (isSold(item)) {
    card.classList.add('is-sold');
    if (badge) badge.hidden = false;
  } else {
    card.classList.remove('is-sold');
    if (badge) badge.hidden = true;
  }
};

const items = {
  //FURNITURE LIBRARY//
  'cherry-dining-table': ['sold', 'Furniture', '8ft River Dining Table', '$5,400', '96 in L × 48 in W × 30 in H', 'Aneja_Dining_Table', 'Black Cherry · Dining', 'A statement dining table shaped from rich cherry with a natural live edge and a dark resin river. Built for long dinners and everyday life.'],
  'waterfall-coffee-table': ['sold', 'Furniture', 'XL Waterfall Coffee Table', '$3,850', '68 in L × 30 in W × 16 in H', 'Aneja_Coffee_Table', 'Black Cherry · Living room', 'A low-profile live edge coffee table that brings the grain and character of the slab into focus. Finished with durable natural oil.'],
  'poplar-desk': ['sold', 'Furniture', 'Adjustable Live Edge Computer Desk', '$1,950', '76 in L × 28.5 in W × 26-56 in H', 'Poplar_Desk', 'Poplar · Office', 'A live-edge adjustable height poplar computer desk with a black resin river running through the slab. Built for daily work with a durable finish and a surface made to hold up to monitors, books, and everyday use. Features adjustable height with dual motor legs that can withstand up to 500lbs'],
  'walnut-computer-desk': ['sold', 'Furniture', 'Walnut Live Edge Computer Desk', '$2,150', '68 in L × 26 in W × 26-56 in H', 'Walnut_Computer_Desk', 'Walnut · Office', 'A walnut live-edge computer desk shaped to show the natural movement of the slab. Finished for everyday use with room to work comfortably and display the warmth of the wood.'],
  'infinity-coffee-table': ['available', 'Furniture', '"Infinity" Coffee Table', '$3,000', '48 in L × 29 in W × 16 in H', 'Infinity_Coffee_Table', 'Olivewood · Living Room', 'An olivewood coffee table with a sculptural "infinity" form steel base. The flowing silhouette and rich olivewood grain make it a focal point for a living room while staying low and practical for everyday use. The base is made from a single piece of 2 inch square steel that wraps around, connecting where it started to create a infinite loop. Entirely handmade in Rockville, MD this piece is completely original and one-of-one. There will never be another piece like this anywhere in the world.'],
  'maple-console-table': ['available', 'Furniture', 'Maple Console Table', '$1,150', '54 in L × 14 in W × 30 in H', 'furniture', 'Maple · Entryway', 'A slim console table with a clean silhouette and a broad maple top. Designed for hallways, studios, and thoughtful display.'],
  //PHOTOGRAPHY LIBRARY//
  'corporate-headshots': ['available', 'Photography', 'Corporate Headshots', 'From $200', '60–90 minute session · 8 edited images', 'Headshots', 'People · Professional', 'Polished, relaxed headshots for teams, founders, and professionals. Includes planning, a focused studio or on-location session, and edited final images.'],
  'engagement-session': ['available', 'Photography', 'Engagement Session', 'From $300', '90 minute session · ~35 edited images', 'Engagement', 'People · Couples', 'A relaxed outdoor session that captures your connection without forcing the moment. We will plan a location and simple visual direction together.'],
  'graduation-photoshoot': ['available', 'Photography', 'Graduation Shoot', 'From $250', '90 minute session · 25 edited images', 'Graduation', 'People · Celebration', 'A confident, expressive graduation session that feels like you. We focus on the milestone, your personality, and the photos that will still feel current years from now.'],
  'birthday-photoshoot': ['available', 'Photography', 'Birthday Shoot', 'From $300', '90 minute session · 30 edited images', 'Birthday', 'People · Celebration', 'A joyful birthday session filled with laughter, movement, and the candid details that make the day feel real. Perfect for kids, teens, or adults wanting a clean, playful portrait set.'],
  'couples-photoshoot': ['available', 'Photography', 'Couples Shoot', 'From $300', '90 minute session · 30 edited images', 'Couples', 'People · Couples', 'An easygoing couples session focused on genuine connection and natural emotion. We photograph the moments that feel effortless, romantic, and uniquely yours.'],

  'branding-business': ['available', 'Photography', 'Branding & Business', 'From $500', '2 hour session · 50 edited images', 'business', 'Business · Storytelling', 'A visual library for your business: portraits, workspace details, products, and the small moments that make your brand feel real.'],
  'product-photography': ['available', 'Photography', 'Product Photography', 'From $300', 'Up to 8 products · 20 edited images', 'business', 'Business · Products', 'Clean, tactile product imagery made for websites, launches, social media, and catalogs. We will shape a shot list around your needs.'],
  'real-estate-story': ['available', 'Photography', 'Real Estate Story', 'From $200', 'Up to 2,000 sq ft · 25 edited images', 'business', 'Business · Spaces', 'Warm, accurate images that help a property feel like a place. Built for listings, rentals, and spaces that deserve attention.'],
  'creative-direction': ['available', 'Other Work', 'Creative Direction', 'From $750', 'Half-day direction · Concept deck · One revision', 'creative', 'Creative · Strategy', 'Shape the visual direction of a launch, campaign, or personal project. Includes concept development, references, and a practical creative plan.'],
  'custom-art-piece': ['available', 'Other Work', 'Custom Art Piece', 'From $600', 'Custom scope · 4–8 week lead time', 'creative', 'Creative · Object', 'A one-off handmade object built around your space, story, or idea. We will develop the material, scale, and finish together.'],
  'space-styling': ['available', 'Other Work', 'Space Styling', 'From $900', 'One room · Styling plan · Sourcing list', 'spaces', 'Spaces · Interiors', 'Thoughtful styling for a room, studio, or small commercial space. We focus on materials, placement, light, and the feeling people take away.'],
  'brand-story-package': ['available', 'Other Work', 'Brand Story Package', 'From $1,200', 'Strategy call · Shoot day · 40 edited assets', 'creative', 'Creative · Brand', 'A compact visual story for an emerging brand, combining creative direction, photography, and a set of launch-ready assets.'],
  'workshop-experience': ['available', 'Other Work', 'Workshop Experience', '$175 per person', '2.5 hours · Groups of 4–8', 'spaces', 'Spaces · Learning', 'A small-group introduction to making with wood. Guests learn the basics, make a useful object, and leave with something made by hand.'],
  'collaboration-session': ['available', 'Other Work', 'Collaboration Session', 'From $450', '3 hour session · Follow-up notes', 'creative', 'Creative · Consulting', 'A focused working session for artists, makers, and entrepreneurs who want a second set of eyes and a thoughtful creative partner.'],
  // Other Work //
  'picnic-table': ['sold', 'Other Work', 'Picnic Table', '$800', '', 'Picnic_Table', 'Outdoor · Furniture', 'A handcrafted outdoor table designed for gathering, shared meals, and time spent outside. Contact us for available finishes, dimensions, and delivery details.'],
  'red-oak-dresser': ['sold', 'Other Work', 'Red Oak 2 Piece Dresser Set', '$1,500', '', 'Red_Oak_Dresser', 'Red oak · Storage', 'A warm red-oak dresser made to bring practical storage and lasting character to a room. Contact us for dimensions, finish options, and availability.'],
  //'picnic-table': ['sold', 'Other Work', 'Picnic Table', '$800', 'Custom dimensions available', 'Picnic_Table', 'Outdoor · Furniture', 'A handcrafted outdoor table designed for gathering, shared meals, and time spent outside. Contact us for available finishes, dimensions, and delivery details.']

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
    const soldClass = isSold(item) ? ' is-sold' : '';
    const badge = isSold(item) ? '<span class="sold-badge">Sold</span>' : '';
    return `<article class="product reveal${soldClass}"><div class="product-media"><a class="product-image-link" href="detail.html?item=${itemId}" aria-label="View ${item[ITEM.TITLE]}"><img src="${image}" alt="${alt}">${badge}</a></div><h3>${item[ITEM.TITLE]}</h3><p>${displayPrice(item)}</p><small>${item[ITEM.SPECS]}</small><a class="button button-dark" href="detail.html?item=${itemId}">View details</a></article>`;
  }).join('');
  registerRevealElements(featuredGrid);
}

// Populate catalog cards from items{} and make the whole card clickable.
document.querySelectorAll('.catalog-card').forEach((card) => {
  const itemId = card.dataset.item || card.querySelector('a[href*="item="]')?.href.split('item=')[1];
  const item = items[itemId];
  if (!item) return;
  card.querySelector('h3').textContent = item[ITEM.TITLE];
  card.querySelector('.card-info p').textContent = item[ITEM.LABEL] || item[ITEM.CATEGORY];
  card.querySelector('.card-info strong').textContent = displayPrice(item);
  applySoldToCatalogCard(card, item);
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

// ---------------------------------------------------------------------------
// Detail-page gallery (detail.html only)
// Loads images from images.json manifests or fallback URL arrays, then builds
// a swipeable carousel with a thumbnail strip below.
// ---------------------------------------------------------------------------
const detailImage = document.querySelector('#detail-image');

if (detailImage) {
  (async () => {
  // Maps each product's imageSet key (item[ITEM.IMAGE_SET]) to either a local manifest path
  // or a hard-coded URL array for products without their own image folder yet.
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
    Graduation: 'images/Photography/Graduation/images.json',
    Birthday: 'images/Photography/Birthday/images.json',
    Couples: 'images/Photography/Couples/images.json',

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
  // URL param: detail.html?item=product-slug
  const itemId = new URLSearchParams(window.location.search).get('item');
  const item = items[itemId] || items['cherry-dining-table'];
  const imageSetSource = imageSets[item[ITEM.IMAGE_SET]];

  // Fetch images.json when the source is a path; otherwise use the URL array directly.
  const imageSet = typeof imageSetSource === 'string'
    ? await fetch(imageSetSource).then((response) => {
      if (!response.ok) throw new Error(`Could not load ${imageSetSource}`);
      return response.json();
    })
    : imageSetSource;

  // Manifests list filenames only — prepend the folder path to build full URLs.
  if (imageSet.full && imageSet.thumbs) {
    const manifestFolder = imageSetSource.substring(0, imageSetSource.lastIndexOf('/') + 1);
    imageSet.full = imageSet.full.map((filename) => `${manifestFolder}${filename}`);
    imageSet.thumbs = imageSet.thumbs.map((filename) => `${manifestFolder}${filename}`);
  }
  const images = Array.isArray(imageSet) ? imageSet : imageSet.full;
  const thumbnails = Array.isArray(imageSet) ? imageSet : imageSet.thumbs;
  let currentImage = 0;
  document.title = `${item[ITEM.TITLE]} | Edwin Arevalo`;
  document.querySelector('#detail-kicker').textContent = item[ITEM.CATEGORY];
  document.querySelector('#detail-title').textContent = item[ITEM.TITLE];
  document.querySelector('#detail-price').textContent = displayPrice(item);
  document.querySelector('#detail-description').textContent = item[ITEM.DESCRIPTION];
  document.querySelector('#detail-specs').textContent = item[ITEM.SPECS];
  document.querySelector('#back-link').href = item[ITEM.CATEGORY] === 'Furniture' ? 'furniture.html' : item[ITEM.CATEGORY] === 'Photography' ? 'photography.html' : 'other-work.html';

  const inquiryButton = document.querySelector('.inquiry-button');
  const detailNote = document.querySelector('.detail-note');
  const galleryMain = document.querySelector('.gallery-main');
  if (isSold(item)) {
    document.body.classList.add('detail-sold');
    if (inquiryButton) {
      inquiryButton.textContent = 'Request something similar';
      inquiryButton.href = 'contact.html';
    }
    if (detailNote) {
      detailNote.textContent = 'This piece has sold. We can discuss a similar commission via the contact form.';
    }
    if (galleryMain && !galleryMain.querySelector('.sold-badge')) {
      const galleryBadge = document.createElement('span');
      galleryBadge.className = 'sold-badge sold-badge-gallery';
      galleryBadge.textContent = 'Sold';
      galleryMain.append(galleryBadge);
    }
  }
  const imageElement = document.querySelector('#detail-image');
  const galleryTrack = document.querySelector('#gallery-track');
  const countElement = document.querySelector('#gallery-count');
  const thumbsElement = document.querySelector('#gallery-thumbs');
  // --- Performance: slide virtualization ---
  // Only load full-size images for the current slide and its neighbors.
  // URLs live in data-src until mountSlide sets src, so 15+ photos do not
  // all download on page load.
  const LOAD_WINDOW = 1;

  // First N thumbnails load immediately (covers ~one row on desktop);
  // the rest defer until the browser decides they are near the viewport.
  const EAGER_THUMBS = 8;

  // Create one <img> per slide in the track. Reuse #detail-image for index 0.
  const slideElements = images.map((image, index) => {
    const slide = index === 0 ? imageElement : document.createElement('img');
    slide.className = 'gallery-slide';
    slide.dataset.src = image;
    slide.alt = `${item[ITEM.TITLE]} image ${index + 1}`;
    if (index > 0) galleryTrack.appendChild(slide);
    return slide;
  });

  // Assign src from data-src so the browser starts downloading this slide.
  const mountSlide = (index) => {
    const slide = slideElements[index];
    if (!slide.dataset.src || slide.getAttribute('src')) return;
    slide.src = slide.dataset.src;
  };

  // Remove src to free memory; skip the slide currently on screen.
  const unmountSlide = (index) => {
    if (index === currentImage) return;
    const slide = slideElements[index];
    slide.removeAttribute('src');
    slide.classList.remove('is-landscape', 'is-portrait');
  };

  // Keep only slides within LOAD_WINDOW of the current index mounted.
  const syncMountedSlides = () => {
    images.forEach((_, index) => {
      if (Math.abs(index - currentImage) <= LOAD_WINDOW) mountSlide(index);
      else unmountSlide(index);
    });
  };

  // Mobile CSS uses is-landscape / is-portrait to pick 5:4 vs 4:5 aspect ratio.
  const syncImageOrientation = () => {
    const activeImage = slideElements[currentImage];
    const { naturalWidth, naturalHeight } = activeImage;
    if (!naturalWidth || !naturalHeight) return;
    const isLandscape = naturalWidth >= naturalHeight;
    activeImage.classList.toggle('is-landscape', isLandscape);
    activeImage.classList.toggle('is-portrait', !isLandscape);
  };

  // Scroll the thumb strip only when the active thumb is off-screen.
  // "nearest" avoids centering — it nudges just enough to bring it into view.
  const scrollActiveThumbIntoView = () => {
    const activeThumb = thumbsElement.querySelector('button.active');
    if (activeThumb) activeThumb.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  // Move the horizontal track so the current slide fills the viewport.
  const updateGalleryPosition = (animate = true) => {
    galleryTrack.style.transition = animate ? 'transform .42s cubic-bezier(.22,.61,.36,1)' : 'none';
    galleryTrack.style.transform = `translate3d(${-currentImage * 100}%, 0, 0)`;
  };

  // Switch to a slide by index; wraps around at the ends.
  const showImage = (index, animate = true) => {
    currentImage = (index + images.length) % images.length;
    syncMountedSlides();
    slideElements[currentImage].onload = syncImageOrientation;
    countElement.textContent = `${currentImage + 1} / ${images.length}`;
    thumbsElement.querySelectorAll('button').forEach((thumb, thumbIndex) => thumb.classList.toggle('active', thumbIndex === currentImage));
    updateGalleryPosition(animate);
    scrollActiveThumbIntoView();
    if (slideElements[currentImage].complete) syncImageOrientation();
  };

  // Build the clickable thumbnail strip below the main image.
  thumbnails.forEach((thumbnail, index) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.setAttribute('aria-label', `Show image ${index + 1}`);
    const loading = index < EAGER_THUMBS ? 'eager' : 'lazy';
    thumb.innerHTML = `<img src="${thumbnail}" alt="" loading="${loading}">`;
    thumb.addEventListener('mouseenter', () => showImage(index));
    thumb.addEventListener('focus', () => showImage(index));
    thumb.addEventListener('click', () => showImage(index));
    thumbsElement.appendChild(thumb);
  });
  document.querySelector('.gallery-prev').addEventListener('click', () => showImage(currentImage - 1));
  document.querySelector('.gallery-next').addEventListener('click', () => showImage(currentImage + 1));

  // --- Touch / mouse swipe on the main image ---
  // Pointer events work for both touch and mouse drag. A long swipe can skip
  // multiple slides based on how far the finger or cursor moved.
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
    // Ignore the gesture if the user is scrolling vertically instead.
    if (Math.abs(swipeDeltaX) <= Math.abs(deltaY)) return;
    event.preventDefault();
    // Rubber-band effect at the first and last slide.
    const resistance = (currentImage === 0 && swipeDeltaX > 0) || (currentImage === images.length - 1 && swipeDeltaX < 0) ? 0.35 : 1;
    galleryTrack.style.transform = `translate3d(calc(${-currentImage * 100}% + ${swipeDeltaX * resistance}px), 0, 0)`;
  });

  const finishSwipe = (event) => {
    if (!isDragging) return;
    isDragging = false;
    if (galleryMain.hasPointerCapture(event.pointerId)) galleryMain.releasePointerCapture(event.pointerId);
    // Small movement = stay on current slide; large movement = skip one or more.
    const skippedImages = Math.abs(swipeDeltaX) < 45 ? 0 : Math.max(1, Math.round(Math.abs(swipeDeltaX) / galleryMain.clientWidth));
    showImage(currentImage + (swipeDeltaX < 0 ? skippedImages : -skippedImages));
  };

  galleryMain.addEventListener('pointerup', finishSwipe);
  galleryMain.addEventListener('pointercancel', finishSwipe);

  // Scroll the thumb strip horizontally when using a mouse wheel over it.
  thumbsElement.addEventListener('wheel', (event) => {
    if (thumbsElement.scrollWidth <= thumbsElement.clientWidth) return;
    event.preventDefault();
    thumbsElement.scrollLeft += event.deltaY || event.deltaX;
  }, { passive: false });

  showImage(0);
  })().catch((error) => console.error('Could not load detail gallery:', error));
}
