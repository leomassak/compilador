module.exports = {
  "extends": [
    "airbnb",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:jest/recommended"
  ],
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "import/no-extraneous-dependencies": [
      "error",
      {
        "packageDir": "./"
      }
    ],
    "global-require": "off",
    "consistent-return": "off",
    "no-param-reassign": "off",
    "no-underscore-dangle": "off",
    "import/no-cycle": "off",
    "jsx-a11y/label-has-for": "off",
    "max-len": [
      "error",
      120
    ],
    "jsx-a11y/anchor-is-valid": [
      "error",
      {
        "components": [
          "Link"
        ],
        "specialLink": [
          "to",
          "hrefLeft",
          "hrefRight"
        ],
        "aspects": [
          "noHref",
          "invalidHref",
          "preferButton"
        ]
      }
    ],
    "class-methods-use-this": "warn",
    "react/jsx-filename-extension": "off",
    "react/jsx-props-no-spreading": "off",
    "react/jsx-max-props-per-line": [
      1,
      {
        "maximum": 1
      }
    ],
    "react/prop-types": 0,
    "react/jsx-one-expression-per-line": "off",
    "import/no-webpack-loader-syntax": "off",
    "import/no-named-as-default": "off",
    "import/no-unresolved": "off",
    "react/destructuring-assignment": [
      "off"
    ],
    "no-restricted-globals": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error",
    "linebreak-style": "off"
  },
  "plugins": [
    "react",
    "babel",
    "react-hooks",
    "jest"
  ],
  "env": {
    "node": true,
    "browser": true,
    "es6": true,
    "jest/globals": true
  }
};