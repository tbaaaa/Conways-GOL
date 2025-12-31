# Conway's Game of Life

This web application is based on the cellular automation devised by mathematician John Horton Conway in 1970. Read more on [wikipedia](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life). The application was generated entirely by GPT-5 mini with minimal human input.

Open `index.html` in your browser to run the app. It is a single-file web app using `canvas`.

Controls:

Presets:
- Choose a preset from the `Preset` menu and press `Apply` to center that pattern on the grid. Included presets: Glider, Lightweight spaceship, Pulsar, Gosper glider gun.

Keyboard shortcuts:
- `Space`: Start / Stop
- `N`: Step one generation
- `R`: Randomize grid
- `C`: Clear grid
- `G`: Toggle gridlines

Click cells on the canvas to toggle them. This implementation uses toroidal wrap-around neighbors.
