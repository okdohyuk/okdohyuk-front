cd ..
# github submodule repo address without https:// prefix
SUBMODULE_GITHUB=github.com/okdohyuk/okdohyuk-api-spec

# .gitmodules submodule path
SUBMODULE_PATH=api-spec

# github access token is necessary
# add it to Environment Variables on Vercel
if [ "$GIT_PRIVATE_TOKEN" == "" ]; then
  echo "Error: GIT_PRIVATE_TOKEN is empty"
  exit 1
fi

# stop execution on error - don't let it build if something goes wrong
set -e

# get submodule commit
output=`git submodule status --recursive` # get submodule info
no_prefix=${output#*-} # get rid of the prefix
COMMIT=${no_prefix% *} # get rid of the suffix

# set up an empty temporary work directory
rm -rf tmp || true
mkdir tmp
cd tmp

# checkout the current submodule commit
git init # initialise empty repo
git remote add origin https://$GIT_PRIVATE_TOKEN@$SUBMODULE_GITHUB # add origin of the submodule
git remote update
git checkout main

# move the submodule from tmp to the submodule path
rm -rf .git
cd ..
rm -rf $SUBMODULE_PATH/*
mv tmp/* $SUBMODULE_PATH/

# clean up
rm -rf tmp