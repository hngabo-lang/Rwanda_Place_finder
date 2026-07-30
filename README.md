# Rwanda_Place_finder

A small web app that lets you search for restaurants, shops, hospitals and other places near you in Rwanda.

## What it does and why

Finding a specific type of place nearby (a restaurant, a pharmacy, a shop)
usually means asking someone or scrolling through Google reviews. This app
pulls real place data from Foursquare so you can search by keyword and area,
then filter and sort the results.

## Features

- Search for places by keyword (e.g. "restaurant", "pharmacy") and area
  (Kigali, Huye, Musanze, Rubavu, Muhanga, or Rwamagana)
- Filter results by category
- Sort results by distance or alphabetically
- Shows a clear message if the search fails or the API is down

## Structure
Rwanda-place-finder/
├── .env                    (as template)
├── .gitignore              
├── README.md               
├── package.json            
├── package-lock.json        (appears after you run "npm install")
├── node_modules/             (auto-download, excluded by .gitignore)
├── public/
│   ├── app.js                
│   ├── index.html            
│   └── style.css             
├── routes/
│   └── places.js             
└── server.js                 

## How it's built

- **Backend:** Node.js + Express. This is the part that actually calls
  Foursquare.
- **Frontend:** plain HTML, CSS, and JavaScript.
- **API used:** [Foursquare Places API](https://location.foursquare.com/products/places-api/)

## Running it locally

1. Clone the repo and go into the folder:
   ```
   git clone + url
   cd kigali-places-finder
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Get a free Foursquare API key:
   - Sign up at https://location.foursquare.com/developer/
   - Create a project
   - Copy your Service API Key

4. Create a `.env` file in the project folder and paste api key inside:
   ```
   FOURSQUARE_API_KEY= api key
   PORT=3000
   ```

5. Start the server:
   ```
   npm start
   ```

6. Open `http://localhost:3000` in your browser.
