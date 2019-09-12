magick convert icon.png -resize 16x16 16.png 
magick convert icon.png -resize 32x32 32.png 
magick convert icon.png -resize 64x64 64.png 
magick convert icon.png -resize 48x48 48.png 
magick convert icon.png -resize 128x128 128.png 
magick convert icon.png -resize 256x256 256.png 
magick convert icon.png -resize 512x512 512.png 
magick convert 16.png 32.png 48.png 64.png 128.png 256.png 512.png icon.ico
del /s 16.png
del /s 32.png
del /s 48.png
del /s 64.png
del /s 128.png
del /s 256.png
del /s 512.png