#UAlike Framework
##for automated frontend process.

Bootsraping tool for automated frontend process.

Tasks avaliable from the box:

- Sass compiler with support of glob patterns (gulp-sass) with sourcemaps (gulp-sourcemaps)
- Automatic prefix for css (gulp-cssnano)
- Image optimization (gulp-imagemin)
- Automatic generation of image sprites (gulp-spritesmith)
- Pug template engine (gulp-pug)
- gulp-emitty (resolving pug templates dependence)
- browser-sync for instant source change and testing cross-devices

##Quick installation

1. Clone project from github
2. Install dependencies `npm install` or `yarn install` 
3. Run gulp default task `gulp`

##File structure

###Styles directory:

```
+-- style
|   +-- components      : components. for example, sidebar, nav, toolbar, that may consist from one or more modules
|   +-- mixins          : mixins dir. for re-usable parts of code
|   +-- modules         : modules. Partials, such as buttons, icons etc, that are re-used to build components
|   +-- pages           : specific styles for pages
|   +-- partials        : partials of the page
+-- variables.less      : less file with custom variables
+-- main.less           : main less file, that is the entry point for css compilation
```

###Templates directory:

Pug templates folder
```
+-- template
|   +-- components      : components. for example, sidebar, nav, toolbar, that may consist from one or more modules
|   +-- data            : dummy data (f.ex, names.json)
|   +-- layouts         : layouts for typical page templates
|   +-- mixins          : pug mixins
|   +-- pages           : page directory. Contains partials of root pages
|       +--index
|           +-- _main.pug
|       +--about
|           +-- _main.pug
|   +-- partials        : pages partials (header, head, footer)
+-- index.pug           : Page template example 
+-- about.pug           : Page template example
```
