import "dotenv/config";

async function listModels() {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ No API Key found in env!");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  console.log(
    `Listing models for key: ${apiKey.substring(0, 10)}... via Fetch...`,
  );
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", JSON.stringify(data.error, null, 2));
      return;
    }

    if (data.models) {
      console.log("✅ Available Models:");
      data.models.forEach((m: any) => {
        if (m.name.includes("gemini")) console.log(` - ${m.name}`);
      });
    } else {
      console.error("⚠️ No models found or unexpected format:", data);
    }
  } catch (e) {
    console.error("❌ Network execution failed:", e);
  }
}

listModels();
