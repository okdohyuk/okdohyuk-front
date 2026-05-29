#!/bin/bash
chmod u+x vercel-submodule-workaround.sh
./vercel-submodule-workaround.sh
cd ../
yarn run generate-api -- --name=Blog
yarn run generate-api -- --name=User
yarn run generate-api -- --name=Auth
yarn run generate-api -- --name=Storage
yarn run generate-api -- --name=BlogReply
yarn run generate-api -- --name=Session
yarn run generate-api -- --name=ShortUrl
yarn run generate-api -- --name=Copykiller
yarn run build
yarn run postbuild