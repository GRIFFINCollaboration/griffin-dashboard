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
cp ../xTags/detectors/TIGRESS/* .
cp ../xTags/detectors/SPICE/* .
cp ../xTags/detectors/SHARC/* .
cp ../xTags/detectors/DESCANT/* .
cp ../xTags/spectrumViewer/* .
cp ../xTags/nav/* .
if [ -e combined.js ]; then rm combined.js; fi
mv xDetectorTemplate.js a.js  #detector template needs to come before all detectors that inherit it
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
cp ../*.html .
sed '1,/<\/head>/d' TIGRESS.html > html
cat MIDAShead html >> test2
rm html
mv test2 TIGRESS.html

sed '1,/<\/head>/d' TIPWall.html > html
cat MIDAShead html >> test2
rm html
mv test2 TIPWall.html

sed '1,/<\/head>/d' SPICE.html > html
cat MIDAShead html >> test2
rm html
mv test2 SPICE.html

sed '1,/<\/head>/d' SHARC.html > html
cat MIDAShead html >> test2
rm html
mv test2 SHARC.html

sed '1,/<\/head>/d' DESCANT.html > html
cat MIDAShead html >> test2
rm html
mv test2 DESCANT.html
