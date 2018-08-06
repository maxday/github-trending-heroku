mkdir -p githubTrending
rm -rf githubTrending
git clone git@github.com:maxday/trending.git githubTrending
cp language.json githubTrendings/
cp data.json githubTrending/
cd githubTrending

git add . 
git commit -m "add new files"
git push origin master
