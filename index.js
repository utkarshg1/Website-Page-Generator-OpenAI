import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";
import readline from "readline";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to clean the response (removes triple backticks if present)
function cleanHTMLResponse(htmlContent) {
  return htmlContent.replace(/^```html\s*|```$/g, "").trim();
}

// Function to save HTML content to a file
function saveResponseToHTML(htmlContent, filePath) {
  const cleanedHTML = cleanHTMLResponse(htmlContent);
  fs.writeFile(filePath, cleanedHTML, (err) => {
    if (err) {
      console.error("Error:", err);
    } else {
      console.log(`\nHTML content saved to ${filePath}`);
    }
  });
}

// Function to take user input
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  try {
    const userPrompt = await askQuestion("Enter your webpage description: ");

    if (!userPrompt.trim()) {
      console.error("Error: You must provide a description.");
      return;
    }

    const chunks = [];
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Your goal is to write a single webpage in HTML, CSS and JS \
            using internal CSS and JS inside HTML. Use Bootstrap for styling and \
            add cool animations. Give me the HTML code only. \
            I do not want any explanations. I will save this response to \
            somefile.html, so please do not provide any backticks or extra text. \
            I want only the HTML content.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      var c = chunk.choices[0]?.delta?.content || "";
      chunks.push(c);
      process.stdout.write(c);
    }

    const completeResponse = chunks.join("");
    saveResponseToHTML(completeResponse, "generated_file.html");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
