---
title: "Fun with TypeScript: Spread Operator AHA Moment"
description: My stumbling block of the week
date: 2021-04-24
tags: ["typescript"]
layout: layouts/post.njk
lang: "en"
alternate_lang: "de"
alternate_url: "/posts/0421/typescript-spread-operator-aha"
---

This week, I stumbled over the spread operator and wanted to share my experience. <!-- endOfPreview -->

Here's the scenario:
I want to create an object with a key "name of a test case" and a value that contains an object with named pairs of numbers. I have an array of test case names and an object that contains a schema.

```typescript
const testCases = ["testcase 0", "testcase 1", "testcase 2", "testcase 3"];
const schema = {
    first: {
        a: 0,
        b: 0,
        c: 0,
    },
    second: {
        a: 0,
        b: 0,
        c: 0,
    },
    third: {
        a: 0,
        b: 0,
        c: 0,
    },
};
```

From the names and schema, I want to create a large object that looks like this:

```typescript
const testDataDefaults = {
    "testcase 0": {
        "first": {
            a: 0,
            b: 0,
            c: 0
        },
         "second": {
            a: 0,
            b: 0,
            c: 0
        },
         "third": {
            a: 0,
            b: 0,
            c: 0
        },
    },
    ...
}
```

You quickly write a small loop over the test case names, initiate the collection object, and set the schema for each test case:

```typescript
const testDataDefaults = {};
testCases.forEach((testCase) => {
    testDataDefaults[testCase] = {
        ...numbers,
    };
});
```

The line `...numbers` creates a clone of the schema and assigns it to the test case name.

This default object is then filled with real data in the next step. My initial approach, without thinking too much, looked like this:

```typescript
testDataDefaults["testcase 0"].first.a = 23;
testDataDefaults["testcase 0"].first.b = 42;
testDataDefaults["testcase 0"].first.b = 13;
```

I expected that the "first" object in the first test case would have the number 23 at position "a". But the reality looked different:

```typescript
{
  'testcase 0': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
  'testcase 1': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
  'testcase 2': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
    ...
}
```

Whaaaat?

According to [MDN's spread operator documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals), everything should have worked.

A quick Google search on how to clone objects:

[3 Ways to Clone Objects - Samantha Ming](https://www.samanthaming.com/tidbits/70-3-ways-to-clone-objects/)

So let's try again with all three solutions:

```typescript
tests.forEach((testCase) => {
    spreadMapped[testCase] = {
        ...numbers,
    };
    jsonMapped[testCase] = JSON.parse(JSON.stringify(numbers));
    objectAssignMapped[testCase] = Object.assign({}, numbers);
});

spreadMapped["testcase 0"].first.a = 23;
spreadMapped["testcase 0"].first.b = 42;
spreadMapped["testcase 0"].first.c = 13;

jsonMapped["testcase 0"].first.a = 23;
jsonMapped["testcase 0"].first.b = 42;
jsonMapped["testcase 0"].first.c = 13;

objectAssignMapped["testcase 0"].first.a = 23;
objectAssignMapped["testcase 0"].first.b = 42;
objectAssignMapped["testcase 0"].first.c = 13;
```

And the result was still mixed:

```typescript
// spread
{
  'testcase 0': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
  'testcase 1': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
    ...
}
// json
{
  'testcase 0': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
  'testcase 1': {
    first: { a: 0, b: 0, c: 0 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
    ...
}

// Object assign
{
  'testcase 0': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
  'testcase 1': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  }
  ...
}
```

The spread operator and Object.assign don’t deliver as promised at first glance. I came across the term "shallow clone." While the default object is cloned, the references to "first", "second", and "third" remain intact. The JSON method goes beyond shallow cloning.

The assignment via `spreadMapped["testcase 0"].first.a = 23;` doesn't work. You need to overwrite the assigned object with a fresh one:

```typescript
spreadMapped["testcase 0"] = {
    ...spreadMapped["testcase 0"],
    first: {
        ...spreadMapped["testcase 0"].first,
        a: 23
    }
}

// output
{
  'testcase 0': {
    first: { a: 23, b: 0, c: 0 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
  'testcase 1': {
    first: { a: 0, b: 0, c: 0 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
}
```

That was my tough learning of the week. You can find the code at: [Code here](https://github.com/derKuba/fun-with-typescript/tree/main/240121-spread-aha-moment)

Do you have questions or feedback? Reach out to me on [Twitter](https://twitter.com/der_kuba)
