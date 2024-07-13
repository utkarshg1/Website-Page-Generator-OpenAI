import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to save HTML content to a file
function saveResponseToHTML(htmlContent, filePath) {
    fs.writeFile(filePath, htmlContent, (err) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log(`HTML content saved to ${filePath}`);
        }
    });
}

async function main() {
  const chunks = [];
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Your goal is to write a single webpage in HTML, CSS and JS \
            use internal CSS and JS inside HTML. Give Me HTML Code only. \
            I do not want any explaination. I am going to save this response to \
            somefile.html so please dont provide any backticks and extra things i want HTML content Only.",
        },
        {
          role: "user",
          content:
            "Generate a front page for Data Science Classes Website. \
            Make it beautiful use bootstrap also add some cool animations. \
            Avoid adding any images. Please provide only HTML code",
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
    const completeResponse = chunks.join('');
    saveResponseToHTML(completeResponse, "generated_file.html");
  } catch (error) {
    console.error("Error:", error);
  }
}
main();
