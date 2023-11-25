#!/bin/bash
chmod u+x vercel-submodule-workaround.sh
./vercel-submodule-workaround.sh
cd ../
npm run generate-api -- --name=Blog
next build
next-sitemap