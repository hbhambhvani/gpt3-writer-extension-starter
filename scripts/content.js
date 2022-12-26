// Declare new function
const insert = (content) => {
  const elements = document.getElementsByClassName("droid");

  if (elements.length === 0) {
    return;
  }

  const element = elements[0];

  // Grab the first p tag so we can replace it with our injection
  const pToRemove = element.childNodes[0];
  pToRemove.remove();

  // Split content by \n
  const splitContent = content.split("\n");

  // Wrap in p tags
  splitContent.forEach((content) => {
    const p = document.createElement("p");

    if (content === "") {
      const br = document.createElement("br");
      p.appendChild(br);
    } else {
      p.textContent = content;
    }

    // Insert into HTML one at a time
    element.appendChild(p);
  });
};


chrome.runtime.onMessage.addListener(
  // This is the message listener
  (request, sender, sendResponse) => {
    if (request.message === "inject") {
      const { content } = request;

      // Call this insert function
      const result = insert(content);

      // If something went wrong, send a failes status
      if (!result) {
        sendResponse({ status: "failed" });
      }

      sendResponse({ status: "success" });
    }
  }
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "inject") {
    const { content } = request;

    console.log(content);

    sendResponse({ status: "success" });
  }
});