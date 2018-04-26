set -e

npm run -s build

cd dist
git init
git add -A
git commit -m deploy

git push -f https://mysticatea:${ATOKEN}@github.com/mysticatea/tfjs-trial.git master:gh-pages
