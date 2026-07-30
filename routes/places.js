// handles calls to the Foursquare Places API. keeps this in its own file
// so server.js stays short, and so my API key never has to touch any
// frontend code.

const express = require('express');
// this one is to help web-02 stay active
const fetch = require('node-fetch');
const louter = express.Router();

const API_KEY = process.env.FOURSQUARE_API_KEY;
const BASE_URL = 'https://places-api.foursquare.com/places/search';
const API_VERSION = '2025-06-17';

// Foursquare's newer API wants a latitude/longitude instead of a place
// name, so this is just a small list of coordinates for a few towns in
// Rwanda. anything not on this list just defaults to Kigali. this is only
// used as a fallback if the browser couldn't get the user's real location.
const lokations = {
  kigali: { lat: -1.9441, lng: 30.0619 },
  huye: { lat: -2.5967, lng: 29.7392 },
  musanze: { lat: -1.4996, lng: 29.6337 },
  rubavu: { lat: -1.6791, lng: 29.2661 },
  muhanga: { lat: -2.0838, lng: 29.7563 },
  rwamagana: { lat: -1.9487, lng: 30.4347 }
};

function getCoordinates(areaNme) {
  const sarch = areaNme.toLowerCase().trim();
  const found = Object.keys(lokations).find((town) => sarch.includes(town));
  return found ? lokations[found] : lokations.kigali;
}

// GET /api/places?query=restaurant&near=Kigali&lat=-1.94&lng=30.06
// lat/lng are optional, if the browser shared the user's real location,
// we use that instead of the fixed town coordinates, so "distance" is
// actually measured from where the user really is.
louter.get('/', async (req, res) => {
  // req.query is set by Express itself, so that part has to stay as it is
  const qery = (req.query.query || '').trim();
  const near = (req.query.near || 'Kigali').trim();
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);

  // don't even bother calling the API if the input looks off
  if (qery.length > 100 || near.length > 100) {
    return res.status(400).json({ error: 'That search looks too long, try something shorter.' });
  }

  // if the browser gave us real coordinates, use those. otherwise fall
  // back to the fixed town center from our lookup list.
  const hasRealLocation = !isNaN(userLat) && !isNaN(userLng);
  const coordns = hasRealLocation ? { lat: userLat, lng: userLng } : getCoordinates(near);

  const params = new URLSearchParams({
    ll: `${coordns.lat},${coordns.lng}`,
    radius: '5000',
    limit: '30'
  });
  if (qery) {
    params.set('query', qery);
  }

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
        'X-Places-Api-Version': API_VERSION
      }
    });

    if (!response.ok) {
      console.log('Foursquare returned an error status:', response.status);
      return res.status(502).json({ error: 'The places search is not responding right now. Try again in a bit.' });
    }

    const data = await response.json();

    // pulling out just the fields the frontend actually needs
    const placs = (data.results || []).map((place) => ({
      id: place.fsq_place_id || place.fsq_id,
      name: place.name,
      address: place.location ? place.location.formatted_address : 'No address found',
      categories: (place.categories || []).map((c) => c.name),
      distance: place.distance || null
    }));

    res.json({ places: placs, count: placs.length, usedRealLocation: hasRealLocation });

  } catch (err) {
    console.log('Something went wrong while calling Foursquare:', err.message);
    res.status(500).json({ error: 'Could not reach the places service. Check your connection and try again.' });
  }
});

module.exports = louter;
