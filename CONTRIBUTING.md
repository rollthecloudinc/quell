# How to contribute

Hello there. Looks like you are interested in contributing to [<project-name>](<github-repo>), which is just great, so welcome!
  
We are open to any kind of contribution: code, documentation, bug-fixing (even just reports), feature-requests and anything else you may come up with.

## Getting started

### Roadmap

The project roadmap is a work in progress. However, the issues can viewed in the mean time. Typically issues higher up are higher priority as the moment.

Since the project is constantly evolving and new features are requested/discovered as we go, this roadmap is open for discussions and we expect it to change over time.

Roadmap-wise contributions via new issues are always welcomed.

### Discussion

Please use github forums under project.

## Contributing

### Coding

Nothing fancy here, just:

1. Fork this repo
1. Commit you code
1. Submit a pull request. It will be reviewed by maintainers and they'll give you proper feedback so you can iterate over it.

The project does promote reactive programming best practices.

#### Considerations
- Make sure existing tests pass [Testing policies and implements WIP]
- Make sure your new code is properly tested and fully-covered [Manually testing for the time being]
- Following [The seven rules of a great Git commit message](https://chris.beams.io/posts/git-commit/#seven-rules) is highly encouraged
- When adding a new feature, branch from [master-branch](<project-master-branch>)

### Testing

As mentioned above, existing tests must pass and new features are required to be tested and fully-covered.

NOTE: Testing is work in progress at the moment. This is likely heading in the direction of playwright ot TestCafe.

### Documenting

Code should be self-documented. But, in case there is any code that may be hard to understand, it must include some comments to make it easier to review and maintain later on.