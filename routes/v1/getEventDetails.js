const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const { searchArtistOnSpotify } = require('./getSpotifyDetails'); // Import the Spotify function

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

router.get('/', async (req, res) => {
    const { eventId } = req.query;
    const ticketmasterEventDetailsUrl = `https://app.ticketmaster.com/discovery/v2/events/${eventId}?`;

    try {
        const ticketmasterRequestLink = ticketmasterEventDetailsUrl + new URLSearchParams({
            apikey: TICKETMASTER_API_KEY,
        });

        // Send request to Ticketmaster API
        const eventDetailsResponse = await axios.get(ticketmasterRequestLink);

        // Check if the response status is 200 (OK)
        if (eventDetailsResponse.status === 200) {
            const eventData = eventDetailsResponse.data;

            // Extract required fields for the frontend
            const extractedFields = {
                name: eventData.name,
                date: eventData.dates.start.localDate,
                time: eventData.dates.start.localTime,
                artistNames: eventData._embedded.attractions
                    ? eventData._embedded.attractions.map(attraction => attraction.name)
                    : [],
                venue: eventData._embedded.venues[0]?.name || '',
                genres: eventData.classifications[0]?.segment?.name || '',
                priceRanges: eventData.priceRanges || [],
                ticketStatus: eventData.dates.status.code || '',
                buyTicketUrl: eventData.url || '',
                seatmapUrl: eventData.seatmap?.staticUrl || '',
            };

            // Search for artist on Spotify and get album details
            const artistNames = eventData._embedded.attractions
                ? eventData._embedded.attractions.map(attraction => attraction.name)
                : [];
            
            const spotifyResults = await Promise.all(
                artistNames.map(artistName => searchArtistOnSpotify(artistName))
            );

            extractedFields.spotifyInfo = spotifyResults;

            // Send the extracted fields as JSON response
            res.status(200).json({
                status: 'success',
                eventDetails: extractedFields,
            });
        } else {
            // If the response status is not 200, handle the error
            res.status(500).json({
                status: 'Error contacting Ticketmaster API',
            });
        }
    } catch (error) {
        // Handle any errors that occur during the API request
        console.error('Error fetching event details:', error);
        res.status(500).json({
            status: 'Error contacting Ticketmaster API',
        });
    }
});

module.exports = router;

