#!/bin/bash

cd server && node dev.js &
cd client && npm run dev
