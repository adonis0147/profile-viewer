# profile-viewer
A cross platform desktop application to view profile data of behavior tree which is built by [Electron](https://electron.atom.io/).

## Prerequisite
  - [Node.js](https://nodejs.org/en/) v6.10.0
  - [Electron](https://electron.atom.io/) v1.6.1
  - [D3.js](https://d3js.org/) v4.7.1
  
## Installation And Run
  ```
  git clone https://github.com/adonis0147/profile-viewer
  cd profile-viewer
  npm install`
  electron .
  ```
  
## Example
  1. Open `examples/example.json`  
  2. View it
  
  ![example](https://raw.githubusercontent.com/adonis0147/profile-viewer/master/examples/example.gif)
  
## Speed Up The Installation
  1. To speed up the downloads, you can change the npm registry to a suitable one.
  For example, in China, you can type the following command to change the registry.
  ```
  npm config set registry https://registry.npm.taobao.org
  ```
  2. You can also change the Electron mirror.
  For example, in China, you can add the following code to `.bash_profile`.
  ```
  export ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/"
  ```
  
 ## Application Distribution
  ```
  npm install -g electron-packager-interactive
  epi .
  ```
  More details can be found in [Application Distribution](https://github.com/electron/electron/blob/master/docs/tutorial/application-distribution.md).
