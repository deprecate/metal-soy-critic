# metal-soy-critic

A utility for validating your `metal-soy` components. This tool is not meant to
to do the same work that your javascript or soy compiler already does. Instead
it is meant to check for bad practices in your components.

## Usage

First install `mcritic` from  npm:

```
$ npm install -g metal-soy-critic
```

Then pass it a list of soy files that you would like to check:

```
$ mcritic src/**/*.soy
```
