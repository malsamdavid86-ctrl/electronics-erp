# ====================================================================
# SECURE REVERSE PROXY GATEWAY CONTAINER
# ====================================================================
FROM nginx:1.25-alpine

# Remove standard fallback configurations to mitigate finger-printing risks
RUN rm /etc/nginx/conf.d/default.conf

# Copy your unified system configuration file into Nginx's runtime folder
COPY nginx.conf /etc/nginx/nginx.conf

# Establish explicit path routing for local cache blocks and system logs
RUN mkdir -p /var/cache/nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx

# Run runtime layers on Port 80 for proxy translation
EXPOSE 80

# Drop to limited permission system account to protect host namespaces
USER nginx

# Launch Nginx in the foreground to attach cleanly to Docker's logging driver
CMD ["nginx", "-g", "daemon off;"]
