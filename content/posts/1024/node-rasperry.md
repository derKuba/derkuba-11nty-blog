---
title: "Kindle 3 als Statusdisplay I"
description: Kindle Display
date: 2024-10-03
tags: ["blog"]
layout: layouts/post.njk
#lang: "de"
#alternate_lang: "en"
#alternate_url: "/posts/en/0122/connecting-address-book-to-backend"
eleventyExcludeFromCollections: true
---

image tool
psk anpassen

scp

sudo apt-get install -y build-essential libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev librsvg2-dev libpixman-1-dev

pm2 start npm --name "apigateway" -- start

sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u kuba --hp /home/kuba/apigateway

pm2 unstartup systemd

0 8-23 \* \* \* /usr/bin/node /home/kuba/apigateway/image-creator/create-image.js


ablauf:

jailöbreak
ss
network
mkk
kual
dann erst netzwerk