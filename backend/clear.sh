#!/bin/dash
# Shell script to clear database for local testing purposes

echo "{}" > database/games.database.json
echo "{}" > database/sessions.database.json
echo "{}" > database/users.database.json