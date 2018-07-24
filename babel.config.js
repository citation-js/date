module.exports = {
  "presets": [
    ["@babel/env", {"targets": {
      "browsers": [
        "> 1%",
        "last 10 versions",
        "ie > 7"
      ]}
    }]
  ],
  "env": {
    "test": {
      "plugins": ["istanbul"]
    }
  },
  "comments": false
}
 
