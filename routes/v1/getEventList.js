const express = require('express');
const router = express.Router();
const axios = require('axios');
const geohash = require('ngeohash');
require('dotenv').config();

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const GEOCODING_API_KEY = process.env.GEOCODING_API_KEY;

function createTicketmasterParams(params, category = null) {
    if (category == 'Music') {
        params.segmentId = process.env.MUSIC_ID; 
    } else if (category == 'Sports') {
        params.segmentId = process.env.SPORTS_ID;
    } else if (category == 'Arts & theatre') {
        params.segmentId = process.env.ARTS_ID;
    } else if (category == 'Film') {
        params.segmentId = process.env.FILM_ID;
    } else if (category == 'Miscellaneous') {
        params.segmentId = process.env.MISC_ID;
    } else if (category == 'Default' || category == null) {
        delete params.segmentId;
    }
    return params;
}

async function getGeohashFromAddress(geocodeParams) {
    const geocodeApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json?';
    const geocodeRequestLink = geocodeApiUrl + new URLSearchParams(geocodeParams);

    try {
        const geocodeApiJson = (await axios.get(geocodeRequestLink)).data;

        if (geocodeApiJson.status === 'OK') {
            const location = geocodeApiJson.results[0]?.geometry?.location;
            return location ? geohash.encode(location.lat, location.lng, 7) : null;
        }
    } catch (error) {
        console.error('Error fetching geocode:', error);
    }

    return null;
}

router.get('/', async (req, res) => {
    console.log(req.query);
    const { keyword, radius, category, location, latlong } = req.query;
    console.log(keyword, radius, category, location, latlong);
    if (keyword === undefined || radius === undefined || category === undefined) {
        res.status(500).json({
            status: "Invalid request"
        })
    }

    let geocode_hash = null;
    let geocode_params = { key: GEOCODING_API_KEY };

    if (location === undefined && latlong != undefined) {
        const [lat, lng] = latlong.split(',').map(Number);
        geocode_hash = geohash.encode(lat, lng, 7);
    } else {
        geocode_params['address'] = location;
        geocode_hash = await getGeohashFromAddress(geocode_params);
    }

    if (geocode_hash !== null) {
        try {
            const ticketmaster_event_list_search_url = 'https://app.ticketmaster.com/discovery/v2/events.json?';

            const ticketmaster_params = createTicketmasterParams({
                apikey: TICKETMASTER_API_KEY,
                keyword: keyword,
                segmentId: null,
                radius: radius,
                unit: 'miles',
                geoPoint: geocode_hash,
            }, category);

            const ticketmaster_request_link = ticketmaster_event_list_search_url + new URLSearchParams(ticketmaster_params);
            const ticketmaster_api_response = await axios.get(ticketmaster_request_link);

            if (ticketmaster_api_response.status === 200) {
                const events = ticketmaster_api_response.data._embedded.events.map(event => {
                    return {
                        name: event.name,
                        date: event.dates.start.localDate,
                        time: event.dates.start.localTime,
                        icon: event.images.find(image => image.height === 56)?.url || '',
                        genre: event.classifications[0]?.segment?.name || '',
                        venue: event._embedded.venues[0]?.name || '',
                        id: event.id
                    };
                });

                res.status(200).json({
                    status: ticketmaster_api_response.status,
                    events: events,
                });
                return;
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'Error contacting Ticketmaster API',
            });
            return;
        }
    }

    res.status(400).json({
        status: 'Error getting geocode hash',
    });
});

module.exports = router;
