# metal-soy-critic

[![Build Status](https://travis-ci.org/metal/metal-soy-critic.svg?branch=master)](https://travis-ci.org/metal/metal-soy-critic)

A utility for validating your `metal-soy` components. This tool is not meant to do the same work that your javascript or soy compiler already does. Instead it checks for anti-patterns in your components.

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

By default, `mcritic` will recursively search the current and parent folders for a `.soycriticrc.json` file from the current working directory. Here is an example:

```json
{
  "callToImport": [
    {
      "regex": "(\\S+)",
      "replace": "{$1|param}"
    }
  ]
}
```

Here are the currently supported **settings**:

### `callToImport`

This property is used to provide a list of replacement configurations. Each list item must contain two properties:

- `regex`

  This property is used to provide matches for `replace`. This should be a standard javascript regex that contains capture groups to be referenced in `replace`.

- `replace`

  This property uses match groups defined in `regex` to translate a component name in a soy template to its corresponding import name when validating their import.

  When referencing match groups from `regex`, interpolation should be in the form of `{$n}`, where `n` is the match group number. An example would be `"{$1}.js"`.

  Interpolations can also contain named string transformations delimited by a `|`. This transformation corresponds to the functions provided by [`change-case`](https://www.npmjs.com/package/change-case).

  Examples:
  * `"{$1|lower|snake}.js"`
  * `"{$2}-{$1}"`
  * `"{$1|dot}.js"`


|Type|Default|
|----|-------|
|array|`"[{"regex": "(.*)", "replace": "{$1}"}]"`|

### `implicitParams`

This property is used to provide implicit params when checking if a Soy param is present in a component's STATE configuration. Here is an example:

```json
{
  "implicitParams": {
    ".*Clay": ["visible", "elementClasses"],
    "DropDown": "open"
  }
}
```

Each key shoud be a valid `RegExp` string, which will be used to match a class name in your project. When a match is found, the value (which should be a `string` or `Array<string>`) will be added to the available params for that `class` when compared against it's Soy file.

|Type|Default|
|----|-------|
|object|`{}`|

## Contributing

Feature requests, issues, and pull requests are welcome!
