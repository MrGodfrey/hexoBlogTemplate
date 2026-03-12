find source/_posts -type f -iname "*.png" -exec sh -c 'for img; do convert "$img" "${img%.png}.jpg" && rm "$img"; done' sh {} +

find source/_posts -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -size +500k -ctime -1 -exec mogrify -define jpeg:extent=500KB -quality 85 {} +
