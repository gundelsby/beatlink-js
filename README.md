# JS project template

ESLint, Prettier and Mocha configuration.

No package.json, so after npm init run:\
`npm i --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier esm mocha @sinonjs/referee`

## Automagic formatting on commit

`npm i --save-dev husky lint-staged`

In `package.json`:\

```
"husky": {
  "hooks": {
    "pre-commit": "lint-staged"
  }
},
"lint-staged": {
  "*.{js,css,json,md}": [
    "prettier --write"
  ]
}
```
