---
title: "StencilJS: Connecting Address Book to Backend"
description: How to connect an API using StencilJS.
date: 2022-01-06
tags: ["stenciljs"]
layout: layouts/post.njk
lang: "en"
alternate_lang: "de"
alternate_url: "/posts/0122/adressbuch-anbindung-ans-backend"
---

The last article of 2021 showed how to build a simple and small REST API with Koa. I will use this backend today to connect the address book application to it. <!-- endOfPreview -->  
As a reminder: The address book application uses a global store to store its data. This is the starting point for the integration. The integration involves the following steps:

-   When opening the page, existing contacts are retrieved via a request.
-   If contacts exist, they are written to the store.
-   Saving/Editing sends a request to the API and adds or edits a (new) contact.
-   Deleting sends a DELETE request and receives the updated contact list.

Since the API now manages the contacts, some code sections can be removed. For example, generating UUIDs is no longer necessary.

#### Loading Contacts

The address book route _Home_ is the entry point for displaying the list. The _kuba-list_ component is embedded in this part. This is where the contacts should be fetched. When looking at the lifecycle of StencilJS, you will find the lifecycle method _componentWillRender_. It is always called before rendering and is the right place to request all contacts:

```ts
// kuba-home.ts: simplified
import addressStore from "../../store/address-store";

@Component({
    tag: "kuba-home",
    styleUrl: "kuba-home.css",
    shadow: true,
})
export class KubaHome {
    async componentWillRender() {
        try {
            const response = await fetch("http://localhost:3000/contacts");
            if (response.ok) {
                const contacts = await response.json();

                addressStore.contacts = [...contacts];
            }
        } catch (error) {
            console.log(error);
        }
    }
    render() {}
}
```

The _KubaHome_ class includes the previously mentioned method. Additionally, this method must be declared as _async_ so that we can use _await_ and work with promises. To make _HTTP requests_, I use the [built-in Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch). There, you'll find all the necessary functions:

```ts
// fetch example
const response = await fetch(url, {
    // HTTP request methods: GET, POST, PUT, DELETE, etc.
    method: 'POST',
    headers: {
        // specifying the data type being sent
      'Content-Type': 'application/json'
    },
    // the data being sent, matching the header
    body: JSON.stringify(data)
  });
}
```

We take this request skeleton and apply it to the GET route for the contacts:

```ts
const response = await fetch("http://localhost:3000/contacts");
if (response.ok) {
    const contacts = await response.json();

    addressStore.contacts = [...contacts];
}
```

The Fetch function only requires the backend URL to be passed. Ideally, you would store this URL in environment variables, as "localhost" only works in a local setup. For initial understanding, this is sufficient.  
The response object includes an attribute that tells whether the request was successful: _.ok_. This is where you either read the data or display an error in the application. If everything is in order, you need to retrieve the JSON data as a promise and write it to the global store. Since this happens before rendering (blocking), the page is only displayed once the data is available. This could be an issue with a slow internet connection. Many applications display an empty shell, a table, or a loading spinner while the data is being loaded.

#### Saving the Contact

The saving process takes place in _kuba-address-from.tsx_. The difference from the previous implementation is that you no longer need to differentiate between creating and editing. The interface provides a single route for both actions. You also no longer need to generate the ID. The user experience is affected in that, once you save a new contact, you're automatically in edit mode. To add another contact, you'll need to navigate back through the main page.

```ts
  private onSubmit = async () => {

    const id =
      this.idState === undefined
        ? this.match?.params.id
          ? this.match?.params.id
          : null
        : this.idState;

    let data = {
      firstName: this.firstNameState,
      lastName: this.lastNameState,
      address: this.addressState,
      id: id,
    };

    const contactResponse = await fetch("http://localhost:3000/contacts", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (contactResponse.ok) {
      const contact = await contactResponse.json();
      this.addressState = contact.address;
      this.firstNameState = contact.firstName;
      this.lastNameState = contact.lastName;
      this.idState = contact.id;
    }
  };
```

The connection to the API happens in the submit method of the save button. The contact ID is read from the state. If the state is empty, it checks the URL for an ID. If both cases are empty, the ID is set to "null." The field data is taken from the corresponding state fields and passed to the familiar Fetch function. The Fetch method is "POST" this time, allowing the backend to differentiate between routes. If the request is successful, the state fields are updated with the contact returned from the API. At this point, you could add a notification for the user.

#### Deleting the Contact

The functionality to delete a contact is found in the _kuba-list.tsx_ file. Previously, the contact array in the store was filtered based on the passed ID, and the corresponding entry was removed.

```ts
deleteContact = async (id: string) => {
    // old implementation
    // const filteredArray = addressStore.contacts.filter(
    //   (item) => item.id !== id,
    // );
    // addressStore.contacts = filteredArray;

    const response = await fetch(`http://localhost:3000/contacts/${id}`, {
        method: "DELETE", // *GET, POST, PUT, DELETE, etc.
    });

    if (response.ok) {
        const newContactList = await response.json();
        addressStore.contacts = [...newContactList];
    }
};
```

The API works such that, after sending a DELETE request, the updated contact list is returned. Therefore, only the contact list in the store needs to be updated.

#### Conclusion

The changes to connect the backend are not very extensive but have far-reaching consequences. Data handling has been handed over from the frontend. The complexity of logic, as well as data storage and management, now belongs to the backend's concerns.

Do you have any questions or suggestions? Feel free to reach out to me on [Twitter](https://twitter.com/der_kuba).
Thank you so much for reading!

Kuba
