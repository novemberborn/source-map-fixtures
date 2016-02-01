# Maintaining

## Testing

* `npm test`: Run tests and lint code
* `npm run coverage`: Run tests with coverage

## Generating fixtures

Edit or add new source files in the `src/` directory. Please update the README
as appropriate. Then run the following to generate the fixtures:

```
npm run generate
```

Commit changes and open a PR!

Please note that any changes to the source maps are considered breaking.

## Rollup and Babel dependencies

Rollup and Babel dependencies are pinned to an exact version. Newer versions
might impact the generated fixtures and source maps. These might be breaking
changes and should be avoided if possible.

An `npm-shrinkwrap.json` file is included. It must be updated whenever the
Rollup and Babel dependencies are changed. Note that it is ignored for CI
purposes, allowing [Greenkeeper](http://greenkeeper.io/) to suggest updates.

If tests start to fail it might be that a transitive dependency of Rollup or
Babel is starting to impact the generated fixtures and source maps. It should be
possible to pin that dependency given the shrinkwrap file.
