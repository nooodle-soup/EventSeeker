const axios = require('axios');
require('dotenv').config();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const searchArtistOnSpotify = async (artistName) => {
    try {
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'client_credentials'
            }),
            {
                auth: {
                    username: SPOTIFY_CLIENT_ID,
                    password: SPOTIFY_CLIENT_SECRET
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const accessToken = tokenResponse.data.access_token;

        const searchResponse = await axios.get(
            `https://api.spotify.com/v1/search`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                params: {
                    q: artistName,
                    type: 'artist'
                }
            }
        );

        const matchedArtists = searchResponse.data.artists.items;
        const inputWords = artistName.toLowerCase().split(' ');

        let bestMatch = { artist: null, matchedWords: 0, numWords: 0 };

        for (let i = 0; i < matchedArtists.length; i++) {
            const current = matchedArtists[i];
            if (current?.name.toLowerCase() === artistName.toLowerCase()) {
                bestMatch = {artist: current}
            }
            const currentWords = current.name.toLowerCase().split(' ');
            const matchedWords = inputWords.filter(word => currentWords.includes(word)).length;

            if (matchedWords > bestMatch.matchedWords ||
                (matchedWords === bestMatch.matchedWords && currentWords.length === bestMatch.numWords)) {
                bestMatch = { artist: current, matchedWords: matchedWords, numWords: currentWords.length };
            }
        }
        if (bestMatch.artist) {
            const artistId = bestMatch.artist.id;

            const albumsResponse = await axios.get(
                `https://api.spotify.com/v1/artists/${artistId}/albums`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    params: {
                        limit: 3
                    }
                }
            );

            return {
                artist: bestMatch.artist,
                albums: albumsResponse.data?.items || []
            };
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
};

module.exports = {
    searchArtistOnSpotify
};

