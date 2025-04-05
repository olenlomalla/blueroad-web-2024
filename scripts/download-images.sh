#!/bin/bash

# Create directories if they don't exist
mkdir -p public/images/portfolio

# Download placeholder images for the e-commerce project
curl -o public/images/portfolio/ecommerce.jpg https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80
curl -o public/images/portfolio/ecommerce-1.jpg https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80
curl -o public/images/portfolio/ecommerce-2.jpg https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80
curl -o public/images/portfolio/ecommerce-3.jpg https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80

# Add more portfolio images here
# Web Development
curl -o public/images/portfolio/web-app.jpg https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80
curl -o public/images/portfolio/web-design.jpg https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&q=80

# UI/UX Design
curl -o public/images/portfolio/ui-design.jpg https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80
curl -o public/images/portfolio/mobile-app.jpg https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80

# Video Production
curl -o public/images/portfolio/video-prod.jpg https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=800&q=80
curl -o public/images/portfolio/corporate-video.jpg https://images.unsplash.com/photo-1578022761797-b8636ac1773c?w=800&q=80

echo "Images downloaded successfully!" 