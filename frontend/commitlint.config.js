export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 120],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 100],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'feat', // Indicates a new feature for the user.
        'fix', // Represents a bug fix for the user.
        'docs', // Changes only to documentation.
        'style', // Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.).
        'refactor', // A code change that neither fixes a bug nor adds a feature.
        'perf', // A code change that improves performance.
        'test', // Adding missing tests or correcting existing tests.
        'ci', // Changes to CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs).
        'build', // Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm).
        'chore', // Other changes that don't modify src or test files. Often used for maintenance tasks.
        'revert', // Reverts a previous commit.
      ],
    ],
  },
}
