const userId = 1;

function getItem(itemID) {
  fetch("https://jsonplaceholder.typicode.com/posts/" + itemID)
    .then((response) => response.json())
    .then((json) => console.log(json));
}

function postItem(title, body) {
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: JSON.stringify({
      title: title,
      body: body,
      userId: userId,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
}

function putItem(title, body, postID) {
  fetch("https://jsonplaceholder.typicode.com/posts/" + postID, {
    method: "PUT",
    body: JSON.stringify({
      id: postID,
      title: title,
      body: body,
      userId: userId,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
}

function deleteItem(postID) {
  fetch("https://jsonplaceholder.typicode.com/posts/" + postID, {
    method: "DELETE",
  });
}

getItem(1);
postItem("Hello", "my first post!");
putItem("Hello", "my first (edited) post!", 1);
deleteItem(1);
