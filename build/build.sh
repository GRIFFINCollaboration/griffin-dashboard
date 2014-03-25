#cleanup:
rm ./*.js
rm ./*.css

#Concat all JS:
cp ../lib/*.js .
cp ../utilities/*.js .
cp ../xTags/branding/* .
cp ../xTags/runControl/* .
cp ../xTags/detectors/*.js .
cp ../xTags/detectors/TIPwall/* .
if [ -e combined.js ]; then rm combined.js; fi
cat *.js > combined.js

#MIDAS needs gifs not pngs :(
sed 's/.png/.gif/g' combined.js > temp
mv temp combined.js

#MIDAS does it's own image path handling:
sed 's|img/||g' combined.js > temp
mv temp combined.js

#Concat all CSS:
cp ../lib/*.css .
cp ../*.css .
cp ../xTags/detectors/*.css .
if [ -e combined.css ]; then rm combined.css; fi
cat *.css > combined.css

#Put a MIDAS-appropriate head on the html:
cp ../index.html .
sed '1,/<\/head>/d' index.html > html
cat MIDAShead html >> test2
rm html
mv test2 index.html
