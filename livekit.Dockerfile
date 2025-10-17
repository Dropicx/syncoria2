FROM livekit/livekit-server:latest

# Copy LiveKit configuration
COPY livekit.yaml /etc/livekit.yaml

# Expose ports
EXPOSE 7880 7881 7882
EXPOSE 50000-50200/udp

# Use the configuration file
CMD ["--config", "/etc/livekit.yaml"]
