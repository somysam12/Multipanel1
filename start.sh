#!/bin/bash

cd server && node server.js &
cd client && npm run dev
