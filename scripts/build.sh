#!/bin/bash
cd ../
npm run generate-api -- --name=Blog
next build
next-sitemap