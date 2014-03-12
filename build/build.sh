#Concat all JS:
cp ../lib/*.js .
cp ../utilities/*.js .
cp ../xTags/*.js .
if [ -e combined.js ]; then rm combined.js; fi
cat *.js > combined.js

#Concat all CSS:
cp ../lib/*.css .
cp ../*.css .
cp ../xTags/*.css .
if [ -e combined.css ]; then rm combined.css; fi
cat *.css > combined.css

#Put a MIDAS-appropriate head on the html:
cp ../index.html .
sed '1,/<\/head>/d' index.html > html
cat MIDAShead html >> test2
rm html
mv test2 index.html