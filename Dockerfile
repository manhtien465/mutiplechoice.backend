#  FROM node:14.1.0-alpine
# RUN  apt-get update \
#      && apt-get install -y wget gnupg ca-certificates procps libxss1 \
#      && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#      && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#      && apt-get update \
#      # We install Chrome to get all the OS level dependencies, but Chrome itself
#      # is not actually used as it's packaged in the node puppeteer library.
#      # Alternatively, we could could include the entire dep list ourselves
#      # (https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix)
#      # but that seems too easy to get out of date.
#      && apt-get install -y google-chrome-stable \
#      && rm -rf /var/lib/apt/lists/* \
#      && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
#      && chmod +x /usr/sbin/wait-for-it.sh
# FROM node:14.16.0-buster-slim@sha256:ffc15488e56d99dbc9b90d496aaf47901c6a940c077bc542f675ae351e769a12
# RUN  apt-get update \
#      && apt-get install -y wget gnupg ca-certificates procps libxss1 \
#      && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#      && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#      && apt-get update \
#      # We install Chrome to get all the OS level dependencies, but Chrome itself
#      # is not actually used as it's packaged in the node puppeteer library.
#      # Alternatively, we could could include the entire dep list ourselves
#      # (https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix)
#      # but that seems too easy to get out of date.
#      && apt-get install -y google-chrome-stable \
#      && rm -rf /var/lib/apt/lists/* \
#      && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
#      && chmod +x /usr/sbin/wait-for-it.sh
# RUN apt-get update && apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget x11vnc x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps xvfb
# Install Puppeteer under /node_modules so it's available system-wide
FROM node:12-slim
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# If running Docker >= 1.13.0 use docker run's --init arg to reap zombie processes, otherwise
# uncomment the following lines to have `dumb-init` as PID 1
# ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_x86_64 /usr/local/bin/dumb-init
# RUN chmod +x /usr/local/bin/dumb-init
# ENTRYPOINT ["dumb-init", "--"]

# Uncomment to skip the chromium download when installing puppeteer. If you do,
# you'll need to launch puppeteer with:
#     browser.launch({executablePath: 'google-chrome-stable'})
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install puppeteer so it's available in the container.
RUN npm i puppeteer \
    # Add user so we don't need --no-sandbox.
    # same layer as npm install to keep re-chowned files from using up several hundred MBs more space
    && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /node_modules

# Run everything after as non-privileged user.
USER pptruser

CMD ["google-chrome-stable"]

ADD package.json package-lock.json /
WORKDIR /app/
ADD package.json .
RUN yarn install --production=true
ADD  . .

CMD [ "yarn", "start" ]
EXPOSE 3000
# CMD xvfb-run --server-args="-screen 0 1024x768x24" yarn start