# metal-soy-critic

[![Build Status](https://travis-ci.org/mthadley/metal-soy-critic.svg?branch=master)](https://travis-ci.org/mthadley/metal-soy-critic)

A utility for validating your `metal-soy` components. This tool is not meant to
to do the same work that your javascript or soy compiler already does. Instead
it is meant to check for bad practices in your components.

## Usage

First install `mcritic` from  npm:

```
$ npm install -g metal-soy-critic
```

Then pass it a directory containing soy files that you would like to check:

```
$ mcritic src
```

You can also ignore files matching a particular glob:

```
$ mcritic . --ignore "**/{node_modules,classes,build}/**"
```

## Configuration

By default, `mcritic` will recursively search parent folders for a `.soycriticrc` JSON file to find configuration. Example:

```json
{
  "callToImportRegex": "(\\S+)",
  "callToImportReplace": "{$1|param}"
}
```

Here are the currently supported **settings**:

### `callToImportRegex`

This property is used to provide matches for `callToImportReplace`. This should be a standard javascript regex that contains capture groups to be referenced in `callToImportReplace`.

|Type|Default|
|----|-------|
|string|`"(.*)"`|

### `callToImportReplace`

This property uses match groups defined in `callToImportRegex` to translate a component name in a soy template to it's corresponding import name when validing component imports.

When referencing match groups from `callToImportRegex`, interpolation should be in the form `{$n}` where `n` is the match group number. An example would be `"{$1}.js"`.

Interpolations can also contain named string transformations delimted by a `|`. This transformations correspond to the functions provided by [`change-case`](https://www.npmjs.com/package/change-case).

Examples:
* `"{$1|lower|snake}.js"`
* `"{$2}-{$1}"`
* `"{$1|dot}.js"`

|Type|Default|
|----|-------|
|string|`"{$1}"`|

## Contributing

Feature requests, issues, and pull requests are welcome!
