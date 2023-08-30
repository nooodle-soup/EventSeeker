const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

router.get('/', async (req, res) => {
    const keyword = req.query.keyword;
    
    try {
        const suggest_url = "https://app.ticketmaster.com/discovery/v2/suggest?"
        + new URLSearchParams({
            keyword: keyword,
            apikey: TICKETMASTER_API_KEY
        });

        const response = await axios.get(suggest_url);
        const attractions = response.data._embedded.attractions;
        const attraction_names = attractions.map(attraction => attraction.name);

        res.status(200).send(attraction_names);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error fetching autocomplete suggestions',
        });
    }
})

module.exports = router;
