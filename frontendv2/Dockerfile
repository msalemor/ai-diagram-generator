# Use BusyBox as the base image
FROM busybox:latest

# Set the working directory
WORKDIR /www

# Copy your static website files into the image
COPY ./dist/ /www

# Expose port 80
EXPOSE 2382

# Start the BusyBox HTTP server
CMD ["httpd", "-f", "-v", "-p", "2382"]
