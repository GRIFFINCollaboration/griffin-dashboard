#cleanup:
rm ./*.js
rm ./*.css

#Concat all JS:
cp ../static/lib/*.js .
cp ../static/utilities/*.js .
cp ../static/xTags/branding/* .
cp ../static/xTags/runControl/* .
cp ../static/xTags/detectors/*.js .
cp ../static/xTags/detectors/TIP/* .
cp ../static/xTags/detectors/TIGRESS/* .
cp ../static/xTags/detectors/GRIFFIN/* .
cp ../static/xTags/detectors/SPICE/* .
cp ../static/xTags/detectors/SHARC/* .
cp ../static/xTags/detectors/DESCANT/* .
cp ../static/xTags/detectors/DANTE/* .
cp ../static/xTags/detectors/SCEPTAR/* .
cp ../static/xTags/detectors/PACES/* .
cp ../static/xTags/detectors/BAMBINO/* .
cp ../static/xTags/spectrumViewer/* .
cp ../static/xTags/HV/waffle/* .
cp ../static/xTags/nav/* .
if [ -e combined.js ]; then rm combined.js; fi
mv xDetectorTemplate.js xAAADetector.js  #detector template needs to come before all detectors that inherit it
cat *.js > ../static/combined.js

#Concat all CSS:
cp ../static/lib/*.css .
cp ../static/main.css .
cp ../static/xTags/detectors/*.css .
if [ -e combined.css ]; then rm combined.css; fi
cat *.css > ../static/combined.css