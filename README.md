# start-split


[![npm](https://img.shields.io/npm/v/start-split.svg?style=flat-square)](https://www.npmjs.com/package/start-split)
[![linux build](https://img.shields.io/circleci/project/github/effervescentia/start-split/master.svg?label=linux&style=flat-square)](https://circleci.com/gh/effervescentia/start-split)
[![windows build](https://img.shields.io/appveyor/ci/effervescentia/start-split/master.svg?label=windows&style=flat-square)](https://ci.appveyor.com/project/effervescentia/start-split)
[![coverage](https://img.shields.io/codecov/c/github/effervescentia/start-split/master.svg?style=flat-square)](https://codecov.io/github/effervescentia/start-split)
[![deps](https://david-dm.org/effervescentia/start-split.svg?style=flat-square)](https://david-dm.org/effervescentia/start-split)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)
[![greenkeeper](https://badges.greenkeeper.io/effervescentia/start-split.svg)](https://greenkeeper.io/)

split task pipelines for [Start](https://github.com/start-runner/start)

Apply a different set of tasks to each directory. Partially to overcome
[`start-write`](https://github.com/start-runner/write) stripping the root
directory for cases when relative directory structure must be retained (simple typescript + mocha).

## Install

```sh
npm install --save-dev start-split
# or
yarn add --dev start-split
```

## Usage

```js
import Start from 'start';
import reporter from 'start-pretty-reporter';
import files from 'start-files';
import read from 'start-read';
import write from 'start-write';
import split from 'start-split';

const start = Start(reporter());

export const task = () => start(
  files([ 'lib/**/*.js', 'test/**/*.js' ]),
  read(),
  split({
    lib: () => [ write('build/') ],
    test: () => [ write('testBuild/') ]
  })
);
```

This task relies on `[{ path, data, map }]` input and provides the same, see [documentation](https://github.com/start-runner/start#readme) for details.

## Arguments

`startSplit(map, concurrent)`

*   `map` – A map of directory name to a function that returns an array of start tasks.
*   `concurrent` – Run task pipelines simultaneously using [`start-concurrent`][start-concurrent].
    Defaults to `true`.

[start-concurrent]: https://github.com/start-runner/concurrent
