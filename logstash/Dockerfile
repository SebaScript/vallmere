FROM docker.elastic.co/logstash/logstash:8.13.2

# Set environment
ENV LS_JAVA_OPTS="-Xmx512m -Xms512m"

# Add custom files
COPY config/ /usr/share/logstash/config/
COPY pipeline/ /usr/share/logstash/pipeline/

# Install necessary plugins
RUN logstash-plugin install logstash-codec-json

# Ensure proper permissions
USER root
RUN chown -R logstash:logstash /usr/share/logstash/config/
RUN chown -R logstash:logstash /usr/share/logstash/pipeline/
USER logstash

# Define health check
HEALTHCHECK --interval=30s --timeout=10s --retries=5 \
  CMD curl -s -f http://localhost:9600/ || exit 1 