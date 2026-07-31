# Rwanda Place Finder

A simple web app that helps people find places in Rwanda like restaurants, hospitals, shops, and other spots  using real data from the Foursquare API. Instead of scrolling through random lists, you can search, filter, and sort to find exactly what you're looking for.

## What This website Does

Finding good places in a new city can be hard. This app makes it easier by letting you:

- Search for places by name or type (like "restaurant" or "cafe")
- Filter results so you only see what matters to you
- Sort results in a way that makes sense (like by rating or distance)
- See clear, easy-to-read details for each place

This isn't just a random list of places, it's built to actually help someone decide where to go.

## The API We Used

This website uses the **Foursquare Places API** to get real, up-to-date information about places in Rwanda.

- Foursquare API docs: https://location.foursquare.com/developer/reference/place-search

Big thanks to Foursquare for making this data available for developers to build with.

## How to Run This App Locally

Follow these steps to get the app running on your own computer.

### 1. Clone the repository

```bash
git clone url
cd Rwanda_place_finder
```

### 2. Install the backend dependencies

```bash
npm install
```

### 3. Add your API key

Create a file called `.env` add your own Foursquare API key:

```
PORT=3000
FOURSQUARE_API_KEY= api key 
```

**Important:** never share your real `.env` file publicly. It's already listed in `.gitignore` so it won't be uploaded to GitHub by accident. Also a quick Notice the package-lock.json creates itself after running npm install.

### 4. Start the backend server

```bash
npm start
```

You should see a message saying the server is running.

### 5. Open the frontend

Open the `index.html` file in your browser, or serve it with a simple local server. You should now be able to search for places.

## How This App Is Deployed

This app runs on two identical web servers (`web-01` and `web-02`), with a load balancer (`lb-01`) in front of them that spreads out incoming traffic. This means the app can keep working smoothly even if one server gets busy.

### Steps we followed to deploy it

1. Copied the app's frontend and backend files onto both `web-01` and `web-02`
2. Installed Node.js and the required packages on each server
3. Started the backend on each server
4. Set up Nginx on each server to serve the app and forward API requests to the backend
5. Configured HAProxy on `lb-01` to balance traffic between `web-01` and `web-02`
6. Tested that traffic really does switch between both servers

### How we tested the load balancer

I used a simple test route called `/which-server`, which just replies with the name of whichever server answered the request. Refreshing the page (or repeating a request) several times showed it switching between `web-01` and `web-02`, confirming the load balancer works correctly.

## Live Links

- **Deployed app:**(https://www.aristote.tech/)
- **Demo video:** (https://youtu.be/KnEzbQnpl7Y?si=WMQq0Glg8oHGMfvP)
## Challenges We Ran Into

While setting this up, we hit a few real bumps along the way:

- **A public Wi-Fi login page got in the way of testing.** Some of my early tests kept getting redirected to a network login page instead of reaching our server. Switching networks fixed it.
- **HTTP requests kept redirecting to HTTPS.** Our load balancer was set up to force secure connections, so plain `http://` requests bounced to `https://` before reaching our test route.
- **A missing test route caused a "Not Found" error.** Our servers didn't have a `/which-server` path set up yet, so we added a small Nginx rule on each server to return its own name, which let us properly confirm the load balancer was working.

Working through each of these one at a time helped me confirm, step by step, that the whole system frontend, backend, and load balancer, was working the way it should.

## Credits

- Place data powered by [Foursquare](https://location.foursquare.com/)
  
