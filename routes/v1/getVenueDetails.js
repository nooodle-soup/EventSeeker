const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

router.get('/', async (req, res) => {
    const { venue } = req.query;
    const ticketmasterVenueDetailsUrl = `https://app.ticketmaster.com/discovery/v2/venues?`;

    try {
        // Construct the URL for the Ticketmaster Venue Details API request
        const ticketmasterRequestLink = ticketmasterVenueDetailsUrl + new URLSearchParams({
            apikey: TICKETMASTER_API_KEY,
            keyword: venue,
        });

        // Send request to Ticketmaster API for venue details
        const venueDetailsResponse = await axios.get(ticketmasterRequestLink);

        // Check if the response status is 200 (OK)
        if (venueDetailsResponse.status === 200) {
            // Send the venue details as JSON response
            res.status(200).json({
                status: 'success',
                venueDetails: venueDetailsResponse.data, // Sending the actual data
            });
        } else {
            // If the response status is not 200, handle the error
            res.status(500).json({
                status: 'Error contacting Ticketmaster API',
            });
        }
    } catch (error) {
        // Handle any errors that occur during the API request
        console.error('Error fetching venue details:', error);
        res.status(500).json({
            status: 'Error contacting Ticketmaster API',
        });
    }
});

module.exports = router;