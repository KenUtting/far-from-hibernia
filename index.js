let venuesPromise;

async function loadVenues() {
    if (!venuesPromise) {
        venuesPromise = fetch("data/venues.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Could not load venues.json: ${response.status}`);
                }
                return response.json();
            });
    }

    return venuesPromise;
}

async function getVenue(name) {
    const venues = await loadVenues();
    const venue = venues.find((item) => item.name === name);

    if (!venue) {
        throw new Error(`Venue not found: ${name}`);
    }

    return venue;
}

function addUtmParameters(url) {
    const venueUrl = new URL(url);
    venueUrl.searchParams.set("utm_source", "FarFromHiberna");
    venueUrl.searchParams.set("utm_medium", "band_site");
    venueUrl.searchParams.set("utm_campaign", "upcoming_shows");
    return venueUrl.toString();
}

async function populateVenues() {
    const venueLinks = document.querySelectorAll("[data-venue-name]");
    const venueLocations = document.querySelectorAll("[data-venue-location]");

    await Promise.all(
        [...venueLinks].map(async (link) => {
            const venue = await getVenue(link.dataset.venueName);
            link.textContent = venue.name;
            link.href = addUtmParameters(venue.url);
        })
    );

    await Promise.all(
        [...venueLocations].map(async (location) => {
            const venue = await getVenue(location.dataset.venueLocation);
            location.textContent = venue.location;
        })
    );

    const featuredSection = document.querySelector("[data-featured-venue]");
    const featuredVenue = await getVenue(featuredSection.dataset.featuredVenue);
    document.querySelector("[data-featured-venue-name]").textContent = featuredVenue.name;
    document.querySelector("[data-featured-venue-location]").textContent =
        `${featuredVenue.name}, ${featuredVenue.location}`;

    const phoneLink = document.querySelector("[data-featured-venue-phone]");
    const phoneParagraph = document.querySelector("#featured-venue-phone");

    if (featuredVenue.phone) {
        phoneLink.textContent = featuredVenue.phone;
        phoneLink.href = `tel:${featuredVenue.phone.replace(/\D/g, "")}`;
        phoneParagraph.hidden = false;
    } else {
        phoneParagraph.hidden = true;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    populateVenues().catch((error) => {
        console.error(error);
    });
});