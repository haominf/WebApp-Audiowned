#comp 20 team 14 - audiowned
###Ever feel the need to prove to your friends that you’re the bigger hip hop head? Wanna flex your knowledge of today’s top music?  Now you can -- compete against your friends (or nearby strangers) to show off what you know.

We plan to create a multiplayer game in which the users choose a genre of music.  Brief clips of songs are played, and users compete against each other, racing to be the first to correctly name the song.  Using geolocation, users are matched to others that are playing closest to them based on the mode they choose.  Points are awarded depending on the time it took for them to pick the correct song.  The player with the most points at the end of 10 rounds is declared the winner.

###We are planning on using:
- geolocation
- Bootstrap
- RESTful API (Spotify)
- MongoDB

###We will be collecting:
From client:
- Users’ locations
- Genre that user chooses
- Two modes: easy and hard
- Each player’s answer
- Time taken for person to pick an answer (depends on the mode the user picks)
- Total score of every player
- We will be taking user location data as well as the user input for what genre and difficulty they choose.  With these parameters, users will be placed in a match against each other.  As the match is being played, their answers for each round are collected along with the time it took to answer.  When the match ends, each player’s total scores are also collected.

From Spotify API:
- Album art
- We will be collecting songs from Spotify to use for the game.  These will be taken from their curated “moods” and “genres” playlists.  We will also be retrieving the album art from the songs, which will then be shown to the players’ as they try to guess the correct answer.
- User's profile picture
