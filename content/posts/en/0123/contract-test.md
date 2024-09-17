---
title: "Contract Testing with hurl"
description: A simple setup for basic contract tests
date: 2023-01-01
tags: ["testing", "hurl"]
layout: layouts/post.njk
lang: "en"
alternate_lang: "de"
alternate_url: "/posts/0123/contract-test"
---

When moving further up the testing pyramid, you come across contract or service tests. This type of test ensures that the frontend continues to work with the backend or related services after changes or a deployment.<!-- endOfPreview -->

Basically, it's about ensuring a specific response from the interface. In this example, real requests are sent to the interface. This generates some traffic and load on the real services. I would only go this route if you can't agree on a real contract with the backend.

If possible, I would recommend [PACT](https://docs.pact.io/). A broker ensures that the contract (a JSON file) still works. However, you need to invest some effort and infrastructure.

A year ago, I was still writing these tests myself. With Node.js, I would programmatically send _fetch_ requests to my "backend" to ensure that my frontend remained compatible. A colleague pointed me to [hurl](https://hurl.dev/) some time ago. This framework takes care of sending requests, collecting the test files, and providing a nice summary of the tests. It also offers an HTML report, the ability to offload variables to a .env file, and many comparison operations.

![Hurl](/img/0123/hurl.png "hurl testing")

Today, I will show you, using a small backend, how to expect certain data and cookies, use .env files, and generate HTML reporting – all integrated into an NPM project.

### Installation

To integrate hurl into npm, we create a new project:

```bash
mkdir contract-testing
npm init -y
```

Now let's install hurl:

```bash
npm install @orangeopensource/hurl
```

Now we need the test files in the test folder. The .hurl file extension tells hurl where the tests are stored:

```bash
mkdir contract-test
cd contract-test
touch simple.hurl
touch cookie.hurl
touch content.hurl
```

The first test looks like this:

```bash
// simple.hurl

# is application running
GET http://localhost:3000/random
HTTP/1.1 200
```

It sends a _GET_ request to a URL. The response expects a status code 200 in the HTTP 1.1 protocol.

To execute this, we need to add the appropriate script in the _package.json_:

```bash
// package.json
"scripts": {
   "test:contract": "hurl --test --glob contract-test/*.hurl --report-html ./reports --variables-file ./contract-test/contract-testing.env"
 },
```

The command starts hurl with the following options:

| Option           | Meaning                                             |
| ---------------- | --------------------------------------------------- |
| --test           | starts hurl as a test tool with customized output   |
| --glob           | specifies the location and naming of the test files |
| --report-html    | specifies the storage location for the HTML report  |
| --variables-file | specifies the .env file with environment variables  |

Now you just need to run the tests:

```bash
npm run test:contract
```

The output should look like this:

```bash
contract-test/cookies.hurl: Running [1/3]
contract-test/cookies.hurl: Success (1 request(s) in 0 ms)
contract-test/simple.hurl: Running [2/3]
contract-test/simple.hurl: Success (1 request(s) in 0 ms)
contract-test/content.hurl: Running [3/3]
contract-test/content.hurl: Success (1 request(s) in 0 ms)
--------------------------------------------------------------------------------
Executed files:  3
Succeeded files: 3 (100.0%)
Failed files:    0 (0.0%)
Duration:        4 ms
```

### Tests

The existing backend doesn't offer much. On the _/random_ route, there is a JSON response that I generated using [JSON-Generator](https://json-generator.com/). I also added a cookie.

![JSON Response](/img/0123/jsonResponse.png "json response")

![Cookie](/img/0123/cookie.png "cookie")

But it's enough to demonstrate the key benefit. You ensure that a specific request returns a predefined response.

### GET & POST

```ts
# validate response
GET {{base_url}}/random
HTTP/1.1 200
[{"_id":"63b17cafa115a1682550035e","index":0,"gui... truncated for brevity

# send post request

POST {{base_url}}/random
{
  "name": "Kuba"
}

HTTP/1.1 200

[Asserts]
body contains "Hello Kuba"
```

The first test makes a request to the URL (line 2). In line 3, as above, it checks the protocol and status code. The next line contains the expected JSON. If it differs, the test will fail.

The next test is a POST request. It sends a JSON object (lines 8-9). After checking the protocol and status code, the _Asserts_ block follows. You can make comparisons here. At [Hurl Asserts](https://hurl.dev/docs/asserting-response.html), you can see the available set: status, header, url, cookie, body, bytes, xpath, jsonpath, regex, sha256, md5, variable, duration.

I use _body_ to check if the content contains the string "Hello Kuba". The possibilities here are vast.

### Cookie

```ts
// cookie.hurl

GET {{base_url}}/random
HTTP/1.1 200

[Asserts]
cookie "foo" exists
cookie "foo[HttpOnly]" exists
cookie "foo[Secure]" exists
cookie "foo[SameSite]" equals "Lax"
```

In this test, the values of the cookie are checked in the _Asserts_ block. The _cookie_ keyword looks for the specified cookie and checks its properties.

### The .env File

To provide environment variables in different environments, we use the option _--variables-file_ as mentioned above. In this file, variables can be stored:

```ts
// contract-testing.env
base_url=http://localhost:3000
```

Here, the _base_url_ is defined. Of course, this can vary depending on the environment. You could also store login data here.

In the hurl files, you can then access it:

```ts
GET {{base_url}}/random
HTTP/1.1 200
```

Attentive readers may have noticed: If you want to access these variables in the POST body, it must be enclosed in triple quotes.

### The HTML Report

The option _--report-html ./reports_ ensures that after execution, a _reports_ folder appears. Inside, there is an HTML file that, when opened, looks like this:

![hurl report](/img/0123/hurl-report.png "Reporting")

The test results are displayed in a sequence, showing which tests passed and which failed. It's a nice feature, though not extremely information-dense, but it will likely be expanded in future releases.

### Conclusion

This article provides an insight into how to set up and execute this type of test. The benefit is clear: it’s a practical and simple tool. I hope you have fun with it!

The code for this can be found on [Github](https://github.com/derKuba/contract-testing).

Do you have any questions or suggestions? Feel free to reach out to me on [Twitter](https://twitter.com/der_kuba) or [LinkedIn](https://www.linkedin.com/in/jacob-pawlik-08a40015b/).
Thank you so much for reading!

Kuba
