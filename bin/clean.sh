#!/bin/bash

# Remove files that is generated by Webpack.
rm -rf assets/{workbox*,sw*}
rm -rf assets/images/vendor

# Clear bundle files instead of removing them because Jekyll looks for them as linked files.
> assets/main-bundle.css
> assets/main-bundle.js

# Remove all files that is generated by Jekyll.
bundle exec jekyll clean
