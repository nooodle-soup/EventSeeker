const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

router.get('/', async (req, res) => {
    const { keyword } = req.query;
    const ticketmasterVenueDetailsUrl = 'https://app.ticketmaster.com/discovery/v2/venues';

    try {
        // Send request to Ticketmaster API for venue details
        const venueDetailsResponse = await axios.get(ticketmasterVenueDetailsUrl, {
            params: {
                apikey: TICKETMASTER_API_KEY,
                keyword: keyword,
            }
        });

        // Check if the response status is 200 (OK)
        if (venueDetailsResponse.status === 200) {
            // Extract the details of the first venue in the list
            const firstVenue = venueDetailsResponse.data._embedded.venues[0];

            if (firstVenue) {
                // Extract the specific fields from the first venue
                const venueDetails = {
                    name: firstVenue.name,
                    addressLine1: firstVenue.address.line1,
                    cityName: firstVenue.city.name,
                    stateName: firstVenue.state.name,
                    boxOfficeOpenHours: firstVenue.boxOfficeInfo?.openHours || '',
                    boxOfficePhoneNumber: firstVenue.boxOfficeInfo?.phoneNumber || '',
                    generalRule: firstVenue.generalInfo?.generalRule || '',
                    childRule: firstVenue.generalInfo?.childRule || '',
                    location: firstVenue.location
                };

                // Send the extracted venue details as JSON response
                res.status(200).json({
                    status: 'success',
                    venueDetails: venueDetails,
                });
            } else {
                // If no venues found, send an empty response
                res.status(200).json({
                    status: 'success',
                    venueDetails: null,
                });
            }
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

