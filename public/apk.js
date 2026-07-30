// This logic talks to the backend only and also asks the browser for the user's real location, so "closest locations" sorting is measured from where they
// actually are instead of just a town's center point.

const srchForm = document.getElementById('finder-form');
const qeryInput = document.getElementById('what-input');
const nearInput = document.getElementById('where-input');
const catgoryFilter = document.getElementById('type-filter');
const sortPicker = document.getElementById('order-select');
const risaltsList = document.getElementById('spot-list');
const statsMessage = document.getElementById('msg-box');
const darkToggle = document.getElementById('dark-toggle');
const topPicksSection = document.getElementById('top-picks-section');
const topPicksList = document.getElementById('top-picks-list');
const surpriseBtn = document.getElementById('surprise-btn');

// dark mode toggle and handle the actual color swap
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  darkToggle.textContent = document.body.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';
});

let savedSearch = []; // holds the last search results so filtering/sorting doesn't need a new request
let myLocation = null; // { lat, lng } if the browser shares it, otherwise stays null

// ask the browser for the user's location as soon as the page loads.
// if they say no, or their browser doesn't support it, we just fall
// back to searching from the town's center point instead.
function askForLocation() {
  if (!navigator.geolocation) {
    return; // this browser doesn't support geolocation, just skip it
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      myLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    },
    () => {
      // user said no, or it failed for some other reason
      // the search will just use the town center instead
      myLocation = null;
    }
  );
}

function tellUser(message, isError) {
  statsMessage.textContent = message;
  statsMessage.style.color = isError ? '#a83232' : '';
  statsMessage.classList.remove('loading-dots');
}

function tellUserLoading(message) {
  statsMessage.textContent = message;
  statsMessage.classList.add('loading-dots');
}

function distanceLabel(meters) {
  if (meters == null) return '';
  if (meters < 1000) return meters + 'm away';
  return (meters / 1000).toFixed(1) + 'km away';
}

// builds a Google Maps search link from the place's name and address this is just a plain URL
function mapLinkFor(spot) {
  const query = encodeURIComponent(spot.name + ' ' + spot.address);
  return 'https://www.google.com/maps/search/?api=1&query=' + query;
}

function placeCardHtml(spot) {
  return (
    '<h3>' + spot.name + '</h3>' +
    '<div class="place-meta">' +
      (spot.categories.join(', ') || 'Uncategorized') + ' &middot; ' + spot.address +
      (spot.distance != null ? ' &middot; ' + distanceLabel(spot.distance) : '') +
    '</div>' +
    '<a class="map-link" href="' + mapLinkFor(spot) + '" target="_blank">View on Map</a>'
  );
}

function showPlacesOnPage(spots) {
  risaltsList.innerHTML = '';

  if (spots.length === 0) {
    risaltsList.innerHTML = '<p>Nothing found. Try a different search.</p>';
    surpriseBtn.style.display = 'none';
    return;
  }

  surpriseBtn.style.display = 'inline-block';

  for (const spot of spots) {
    const card = document.createElement('div');
    card.className = 'place-card';
    card.dataset.placeId = spot.id;
    card.innerHTML = placeCardHtml(spot);
    risaltsList.appendChild(card);
  }
}

// shows the 3 closest results (from the full, unfiltered search) as a
// highlighted row above the main list
function showTopPicks(spots) {
  if (spots.length === 0) {
    topPicksSection.style.display = 'none';
    return;
  }

  const closestThree = spots
    .slice()
    .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
    .slice(0, 3);

  topPicksList.innerHTML = '';
  for (const spot of closestThree) {
    const card = document.createElement('div');
    card.className = 'top-pick-card';
    card.innerHTML =
      '<span class="badge">Top Pick</span>' +
      '<h4>' + spot.name + '</h4>' +
      '<p>' + (spot.distance != null ? distanceLabel(spot.distance) : spot.address) + '</p>';
    topPicksList.appendChild(card);
  }

  topPicksSection.style.display = 'block';
}

// fills the category dropdown based on whatever categories showed up in this search
function buildCategoryDropdown(spots) {
  const categoryNames = [...new Set(spots.flatMap((s) => s.categories))].sort();
  const previousChoice = catgoryFilter.value;

  catgoryFilter.innerHTML = '<option value="">All</option>';
  for (const name of categoryNames) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    catgoryFilter.appendChild(option);
  }
  catgoryFilter.value = previousChoice;
}

// re-filters and re-sorts whatever is already in savedSearch
function updateVisibleList() {
  let spots = savedSearch.slice();

  if (catgoryFilter.value) {
    spots = spots.filter((s) => s.categories.includes(catgoryFilter.value));
  }

  if (sortPicker.value === 'distance') {
    spots.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  } else {
    spots.sort((a, b) => a.name.localeCompare(b.name));
  }

  showPlacesOnPage(spots);
}

catgoryFilter.addEventListener('change', updateVisibleList);
sortPicker.addEventListener('change', updateVisibleList);

// picks a random visible card and scrolls to it with a little highlight
// pulse this is just a fun way to help decide when there are lots of results
surpriseBtn.addEventListener('click', () => {
  const cards = risaltsList.querySelectorAll('.place-card');
  if (cards.length === 0) return;

  const randomCard = cards[Math.floor(Math.random() * cards.length)];
  randomCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  randomCard.classList.add('highlight-pulse');
  setTimeout(() => randomCard.classList.remove('highlight-pulse'), 1000);
});

srchForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // stop the page from refreshing on submit

  const typedQuery = qeryInput.value.trim();
  const typedArea = nearInput.value.trim();

  tellUserLoading('Searching');
  risaltsList.innerHTML = '';
  topPicksSection.style.display = 'none';

  try {
    let url = '/api/places?query=' + encodeURIComponent(typedQuery) + '&near=' + encodeURIComponent(typedArea);

    // if the browser gave us the user's real location, send it along so
    // distance is measured from where they actually are
    if (myLocation) {
      url += '&lat=' + myLocation.lat + '&lng=' + myLocation.lng;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      tellUser(data.error || 'Something went wrong.', true);
      return;
    }

    savedSearch = data.places;

    const locationNote = data.usedRealLocation ? ' (using your current location)' : ' (using ' + typedArea + ' center)';
    tellUser('Found ' + data.count + ' places' + locationNote + '.', false);

    buildCategoryDropdown(savedSearch);
    showTopPicks(savedSearch);
    updateVisibleList();

  } catch (err) {
    console.log(err);
    tellUser('Can not reach the server. Check your connection.', true);
  }
});

askForLocation();
