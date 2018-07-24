## Install

```js
npm install @citation-js/date
```

## Use

```js
let {parse, format} = require('@citation-js/date')

parse('First Last')
// { given: 'First', family: 'Last' }

format({ given: 'First', family: 'Last' })
// 'First Last'
```

### API

**`parse(String date) -> Object`**

* `String date`: Any date

**`format(Object date[, String delimiter = '-']) -> String`**

* `Object date`: Any date
* `String delimiter`: Separate parts by delimiter

---

Here, `Object` (CSL-JSON author format) can have the following properties:

* `date-parts`: array with one or two dates, each date being an array of [year, month, day], the last two parts being optional
* `raw`: raw date
