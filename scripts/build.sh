#!/bin/bash
chmod u+x vercel-submodule-workaround.sh
./vercel-submodule-workaround.sh
cd ../
yarn run generate-api -- --name=Blog
yarn run generate-api -- --name=User
yarn run generate-api -- --name=Auth
yarn run generate-api -- --name=Storage
next build
next-sitemap