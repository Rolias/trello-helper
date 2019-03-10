# Bare Bones Starter Kit

This is a pretty bare bones starter kit. It does have support for mocha and linting. None of the linting or testing is run automatically. While there is a .travis.yml file it doesn't have to do anything. See the alm-starter-kit (Application Life Cycle management) for a more comprehensive Continuous Deployment approach.

## Basic Git Stuff

After cloning delete the .git folder from the Finder
Then create a new repo up in GitHub (don't create the readme)
At the command line

```bash
git init
#update the readme and commit locally in vscode
#change basic-starter-kit.git to the name of the new github repo
git remote add origin git@github.com:Rolias/new-github-name-goes-here.git
git push -u origin master
```

After those two commands are run, VScode can do push and pull

Don't forget to `npm install`
to install all the packages in the package.json

## Dependencies

The only dependency for the non-development side is winston for logging.  
Packages all use "x" for the semver flag so on a new project the latest versions will get pulled in.