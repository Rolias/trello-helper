module.exports = {
  "bail":true,
  "verbose": true,
  "reporter": "spec",
  "spec":[
    'src/**/*.test.ts',
  ],
  "timeout": 5000,
  "require": [
    "ts-node/register",
    "source-map-support/register"
    ],
}

