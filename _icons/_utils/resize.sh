declare -a ICONS=("flower1" "flower2" "flower3" "flower4" "flower1d" "flower2d" "flower3d" "flower4d")

for ICONNAME in "${ICONS[@]}"
do
    magick convert $ICONNAME.png -resize 16x16 $ICONNAME-16.png 
    magick convert $ICONNAME.png -resize 32x32 $ICONNAME-16@2x.png 
    magick convert $ICONNAME.png -resize 48x48 $ICONNAME-16@3x.png 
done
