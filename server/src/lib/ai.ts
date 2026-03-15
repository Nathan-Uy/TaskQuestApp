import axios from "axios";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let lastCall = 0;
const MIN_DELAY = 60000;

const getKey = (() => {
  let currentKey = 0;
  return () => {
    const keys = [
      process.env.OPEN_ROUTER_API_KEY_1,
      process.env.OPEN_ROUTER_API_KEY_2,
      process.env.OPEN_ROUTER_API_KEY_3,
    ];
    const key = keys[currentKey];
    currentKey = (currentKey + 1) % keys.length;
    return key;
  };
})();

export const llama = async (prompt: string): Promise<string> => {
  const now = Date.now();
  const wait = MIN_DELAY - (now - lastCall);
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();

  for (let attempt = 0; attempt < 3; attempt++) {
    const key = getKey();
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemma-3n-e4b-it:free",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 800,
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "TaskQuest",
          },
        },
      );
      return response.data.choices[0].message.content;
    } catch (err: unknown) {
      const error = err as { response?: { status: number } };
      if (error.response?.status === 429) {
        console.warn(`Key ${attempt + 1} rate limited, rotating...`);
        await sleep(2000);
        continue;
      }
      throw err;
    }
  }

  throw new Error("All OpenRouter API keys exhausted");
};
