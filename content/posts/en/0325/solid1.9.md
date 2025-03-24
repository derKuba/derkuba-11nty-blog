---
title: "Solid 1.9 und Web Components: Event-Target-Drama"
description: Wie man Issues bei github einstellt und warum das wichtig ist.
date: "2025-03-23"
tags: ["solid", "github"]
layout: layouts/post.njk
lang: "de"
alternate_lang: "de"
alternate_url: "/posts/0325/solid1.9"
---

Solid.js has become my favorite framework over the last few months. Nevertheless, I recently encountered some drama while upgrading from Solid 1.8.x to 1.9.x. What happened?

## The Issue

After what seemed to be an innocent update to Solid version 1.9, some of my custom-built Web Components suddenly stopped working as expected. Specifically, reading values from events no longer functioned as usual:

```js
onInput={(e) => {
  console.log(e.target.value); // => undefined
}}
```

What previously worked without issue now returned `undefined`. Panic! My first thought was naturally, "Parcel, this is your fault!"

But even after extensive testing with Vite and Webpack, the error persisted. For once, Parcel was innocent.

## Filing an Issue with the Solid Team

Confused and somewhat desperate, I turned directly to the Solid team. I isolated the problem, created a [minimal example on GitHub](https://github.com/derKuba/solid-eventing-problem), and opened an [issue on GitHub](https://github.com/solidjs/solid/issues/2451).

What happened next exceeded my expectations: Within a few hours, I received detailed responses directly from the Solid team—including from Ryan, the core author himself! My fanboy heart definitely skipped a beat.

![Image](/img/0325/ryan.png "Ryan responds on GitHub")

Ryan patiently explained that the change in Solid 1.9 wasn't a bug, but rather closer to the official DOM behavior. The reason: When an event crosses the boundary of the Shadow DOM, the event target is automatically set to the custom element—not the internal element.

## The Old Code (Before)

My previous code looked something like this:

```js
class KubaTextField extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open", delegatesFocus: true });
        this.shadowRoot.innerHTML = `<input />`;
    }
}

customElements.define("kuba-textfield", KubaTextField);
```

This allowed me to always access the value via `e.target.value`. But that no longer worked.

## The Solution (Refactoring)

To align with the new behavior, I had to slightly adjust my Web Components:

-   Add getter and setter for `value` to reflect the inner element.
-   Intercept events (`input`, `change`) from the inner element and redispatch them with `{ bubbles: true, composed: true }`.

### Adjusted Code (Refactored)

```js
class KubaTextField extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open", delegatesFocus: true });
        this.shadowRoot.innerHTML = `<input />`;

        this._handleInput = this._handleInput.bind(this);
    }

    connectedCallback() {
        this.$input = this.shadowRoot.querySelector("input");
        this.$input.addEventListener("input", this._handleInput);
    }

    disconnectedCallback() {
        this.$input.removeEventListener("input", this._handleInput);
    }

    get value() {
        return this.$input.value;
    }

    set value(val) {
        this.$input.value = val;
    }

    _handleInput(event) {
        this.dispatchEvent(
            new Event("input", { bubbles: true, composed: true }),
        );
    }
}

customElements.define("kuba-textfield-working", KubaTextField);
```

With this refactoring, I could again access the value via `e.target.value` without issues:

```js
onInput={(e) => {
  console.log(e.target.value); // Finally correct again!
}}
```

## My Takeaway

What initially seemed like a Solid or Parcel issue turned out to be standard DOM behavior interacting with Shadow DOM and Web Components. The rapid feedback from the Solid team not only provided me with a solution but also highlighted the importance and value of direct support from framework authors.

Anyone interested in the full, working implementation can find it in my [reproduction repo](https://github.com/derKuba/solid-eventing-problem) under the component `kuba-textfield-working`.

I'm always grateful for feedback.
Feel free to reach out at jacob@derkuba.de

Best regards,

Kuba
