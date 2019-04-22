# Contributing to trello-helper

## Code of Conduct

Help me keep the discussion open and inclusive. Please read and follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Submitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

1. Fork the trello-helper repo.
1. Make your changes in a new git branch:  
  `git checkout -b my-fix-branch master`  
1. Create your patch, including appropriate test cases.
1. Run the unit test suite. See the section below on [#testing]. You don't have to run the integration tests. 
1. Commit your changes using a descriptive commit message.  
`git commit -a`  
Note: the optional commit -a command line option will automatically "add" and "rm" edited files.
1. Push your branch to GitHub:  
`git push origin my-fix-branch`
1. In GitHub, send a pull request to trello-heper:master.

## Testing

There are unit tests and integration tests  
`npm test` runs the unit tests  
`npm run test:int` runs the integration tests  
`npm run test:all` runs them both  
`npm run test:cov` runs them with coverage (by nyc)  
`npm run test:watch` runs the unit tests in watch mode  
`npm run watch` runs the unit tests and eslint in watch mode  
`npm run lint` runs eslint  
`npm run lint:watch` runs eslint in watch mode  

### Integration Tests

The files that end with `test.int.js` do integration testing. In addition to being a useful test for development, they also serve as documentation for the provided functions. They are fragile in that they rely on specific ids that won't exist on your system. These ids and other fragile data are stored in the `test-data/integrations.json` file to make it easier to run integration tests if you're so inclined. You will need to set up a test Trello board with two lists. The second list is used for testing the archive card features.  

## Commit Message Guidelines

These are just suggestions taken from the Angular guidelines on commit meessages.

### Commit Message Format
Each commit message consists of a header, a body and a footer. The header has a special format that includes a type, a scope and a subject:

<type>: <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
The header is mandatory and the scope of the header is optional.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier to read on GitHub as well as in various git tools.

The footer should contain a closing reference to an issue if any.

Samples:
``` text
docs(changelog): update changelog to beta.5

fix(release): need to depend on latest rxjs and zone.js

The version in our package.json gets copied to the one we publish, and users need the latest of these.
```

#### Type

Must be one of the following:

-build: Changes that affect the build system or external dependencies  (example scope: npm, yarn, travis)  
-docs: Documentation only changes  
-feature: A new feature  
-fix: A bug fix  
-performance: A code change that improves performance  
-refactor: A code change that neither fixes a bug nor adds a feature  
-style: Changes that do not affect the meaning of the code (white-space, formatting, removing semi-colons, etc.)  
-test: Adding missing tests or correcting existing tests

#### Subject

The subject contains a short description of the change:

use the imperative, present tense: "change" not "changed" nor "changes"
don't capitalize the first letter
no period at the end

#### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

#### Footer

The footer should contain any information about Breaking Changes and is also the place to reference GitHub issues that this commit Closes.

Breaking Changes should start with the words `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.
