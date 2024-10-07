# Core Web Vitals Report

A Node.js utility that fetches PageSpeed Insights reports and summarizes the data to expedite the process of getting the results. A JSON file will be saved to your desktop.

## Setup

Simply run `npm install` to install dependencies.

## Dependencies

An API Key is needed to reduce the chance of Google's API from not returning results.

You can find this API here:
https://developers.google.com/speed/docs/insights/v5/get-started

Then place the key as an environment variable as seen in the `.env.sample` by creating your own `.env` file.

## Running Script

- `npm start`
- Input a product URL from Shopify store
- Fill out prompts as needed necessary
- Review JSON file saved to your desktop
