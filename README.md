<img src="./src/icons/icon-512x512-round.png" alt="Avatar of Adrian Jost" height="200" align="right">

# 📸 PWCamera

A simple camera PWA to show the capabilities of the web.

I have also [written an article](https://medium.com/p/9bd7aeaf8550) about the techniques used here.

## 📖 Status

[![Netlify Status](https://api.netlify.com/api/v1/badges/40630b40-e105-4d42-b3bd-8896ff6dddc3/deploy-status)](https://app.netlify.com/sites/priceless-agnesi-106338/deploys)
![Dependencies: 0](https://img.shields.io/badge/dependencies-0-brightgreen)
[![Project Status: Inactive – The project has reached a stable, usable state but is no longer being actively developed; support/maintenance will be provided as time allows.](https://www.repostatus.org/badges/latest/inactive.svg)](https://www.repostatus.org/#inactive)

## ✨ Features

- Save all photos in a given directory using the File Access API
- switch between all available cameras
- full offline support with a cache first approach

## 🚧 Limitations

- unfortunately it's currently impossible to set the cameras focus point because of browser-api limitations.

## 🤖 Deployment

To deploy a new version of this project, simply push a new commit to the main branch. But take care of updating the version in [./src/service-worker.js](./src/service-worker.js) because otherwise existing users wouldn't get the update because of the Cache first approach.
