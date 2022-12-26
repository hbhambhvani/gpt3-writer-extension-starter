// Function to get + decode API key
const getKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openai-key'], (result) => {
      if (result['openai-key']) {
        const decodedKey = atob(result['openai-key']);
        resolve(decodedKey);
      }
    });
  });
};


const generate = async (prompt) => {
  // Get your API key from storage
  const key = await getKey();
  const url = 'https://api.openai.com/v1/completions';
  
  // Call completions endpoint
  const completionResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.7,
    }),
  });
  
  // Select the top choice and send back
  const completion = await completionResponse.json();
  return completion.choices.pop();
}


// New function here
const generateCompletionAction = async (info) => {
  try {

    sendMessage('generating...');


    const { selectionText } = info;
    const basePromptPrefix = `
      Let me know what the ICD-9 and ICD-10 diagnosis codes for the following diagnosis are. Please include the full diagonsis lable. If you think what follows is not a medical diagnosis, please return an error message.

      Diagnosis:
      `;

      // Add this to call GPT-3
    const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);
 
    // Send the output when we're all done

    sendMessage(baseCompletion.text);


  } catch (error) {
    console.log(error);

    sendMessage(error.toString());
  }
};

const sendMessage = (content) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0].id;

    chrome.tabs.sendMessage(
      activeTab,
      { message: "inject", content },
      (response) => {
        if (response.status === "failed") {
          console.log("injection failed.");
        }
      }
    );
  });
};

chrome.contextMenus.create({
  id: "context-run",
  title: "Generate ICD codes",
  contexts: ["selection"],
});

chrome.contextMenus.onClicked.addListener(generateCompletionAction);