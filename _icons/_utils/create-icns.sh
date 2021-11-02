ICONNAME="flower4"

magick convert $ICONNAME.png -resize 16x16 16.png 
magick convert $ICONNAME.png -resize 32x32 32.png 
magick convert $ICONNAME.png -resize 64x64 64.png 
magick convert $ICONNAME.png -resize 48x48 48.png 
magick convert $ICONNAME.png -resize 128x128 128.png 
magick convert $ICONNAME.png -resize 256x256 256.png 
magick convert $ICONNAME.png -resize 512x512 512.png 
magick convert 16.png 32.png 48.png 64.png 128.png 256.png 512.png $ICONNAME.icns
rm 16.png
rm 32.png
rm 48.png
rm 64.png
rm 128.png
rm 256.png
rm 512.png