<div align="center">
<img src="public/icon-128.png" alt="logo"/>
<h1>Contentify - Chrome Extension</h1>

![](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![](https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![](https://badges.aleen42.com/src/vitejs.svg)

</div>

A Chrome extension built with React and TypeScript, only for LinkedIn! It helps you scroll through your feed automatically and grab posts that match your chosen keywords. You can download the results in a CSV file or view them in a table format.

## Features <a name="features"></a>

<li>
🚀 Seamless Auto-Scroll
</li>
<li>
🔍 Extract relevant posts based on required and additional keywords.
</li>
<li>
📊 Visualize and explore Scraped posts in table form.
</li>
<li>
📁 Download Scraped posts in CSV format. 
</li>

## Installation <a name="installation"></a>

1. Clone this repository.
2. Install pnpm globally: `npm install -g pnpm` (check your node version >= 16.6, recommended >= 18)
3. Run `pnpm install` to install the required dependencies.
4. Run:
    - For Development: `pnpm dev` or `npm run dev`
    - For Production: `pnpm build` or `npm run build`

### In Chrome: <a name="chrome"></a>

1. Open a new tab in your browser, type in - `chrome://extensions`, and hit Enter.
2. Check/Enable - `Developer mode`
3. Find and Click - `Load unpacked extension`
4. Select - the `dist` folder present in the repository

## Images <a name="images"></a>

### Popup <a name="newtab"></a>

<img width="400" alt="popup" src="public/popup.png">

### Post Table <a name="post table"></a>

<img width="800" alt="popup" src="public/table.png">
