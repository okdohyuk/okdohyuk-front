#!/bin/bash
chmod u+x vercel-submodule-workaround.sh
./vercel-submodule-workaround.sh
cd ../
npm run generate-api -- --name=Blog
npm run generate-api -- --name=User
npm run generate-api -- --name=Auth
npm run generate-api -- --name=Storage
next build
next-sitemap