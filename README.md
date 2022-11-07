# Frutti di Mare

### The Plan

The original plan for this project was to use an api that returns different fruits and their properties. I was then going to use that information to create a _smoothie calculator_. But I couldn't get the api to send proper JSON no matter how much I tried. I worked in the browser but as soon as I tried to use it in vscode with fetch things went awry. Long story short, I changed api! I pivoted to fish instead (since fish is the fruits of the sea).

### The Tools

- HTML
- JavaScript
- SASS
- Excalidraw to make the wireframe.

### The Result

On this web page you can search for different fish and order the results by name, calories, protein or fat. You can also chose how many results you want to show at once. You can then expand each entry to read more about the fish and look at their picture. If you like a specific fish you can add 100grams of it to your collection by clicking the **plus sign** (click multiple times for more). The total calories, protein and fat from all your fishes is then calculated in the top section of your collection. If you change your mind you can remove 100grams of fish at a time by clicking the **X** or remove all of them at the same time with the button up top. The collection is saved in local storage each time you update it.

One big problem I had was loading the pictures. Since i get them straight from the api I don't have any control over the file size. The pictures can take quite some time to load if you're on a slower connection.

I tried my best to make the site responsive and mobile friendly. Hopefully it looks decent on mobile devices even though it is a bit clunky to operate.
