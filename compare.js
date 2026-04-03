exports.config = {
  timeout: 30,
};

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY environment variable is not set." }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body." }),
    };
  }

  const { schools } = body;
  if (!schools || schools.length !== 3) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Please provide exactly 3 schools." }),
    };
  }

  function promptForSchool(school) {
    return `You are a college admissions data expert. Return data for exactly one college.

College: ${school}

Return ONLY a single valid JSON object (no markdown, no explanation, no code fences).

The object must follow this exact structure:
{
  "name": "Short name",
  "fullName": "Full official name",
  "type": "Type of institution (e.g. Technical Institute, State University, Liberal Arts College)",
  "loc": "City, State",
  "sections": {
    "academics": [
      {"k": "US News ranking", "v": "value"},
      {"k": "Acceptance rate", "v": "value"},
      {"k": "Student-faculty ratio", "v": "value"},
      {"k": "Curricular focus", "v": "value"},
      {"k": "Strongest areas", "v": "value"}
    ],
    "cost": [
      {"k": "Tuition & fees", "v": "value"},
      {"k": "Est. total cost of attendance", "v": "value"},
      {"k": "Average aid package", "v": "value"},
      {"k": "Students receiving aid", "v": "value"},
      {"k": "Meets 100% of need?", "v": "Yes / No / Partial"}
    ],
    "campus": [
      {"k": "Undergrad enrollment", "v": "value"},
      {"k": "Setting", "v": "value"},
      {"k": "Housing guarantee", "v": "value"},
      {"k": "Athletics", "v": "value"},
      {"k": "Social structure", "v": "value"}
    ],
    "outcomes": [
      {"k": "6-year graduation rate", "v": "value"},
      {"k": "Go to graduate school", "v": "value"},
      {"k": "Median early-career salary", "v": "value"},
      {"k": "Top sectors", "v": "value"}
    ],
    "research": [
      {"k": "Undergrad participation rate", "v": "value"},
      {"k": "Signature programs", "v": "value"},
      {"k": "Annual research expenditure", "v": "value"},
      {"k": "Key internship pipeline", "v": "value"},
      {"k": "Senior thesis required?", "v": "Yes / No / Optional"}
    ]
  }
}

Use ~ for approximate values. Keep all values short (phrases, not sentences). Return only the raw JSON object.`;
  }

  async function fetchSchool(school) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: promptForSchool(school) }],
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      let errMsg = "Anthropic API error.";
      try { errMsg = JSON.parse(text).error?.message || errMsg; } catch {}
      throw new Error(errMsg);
    }

    const data = JSON.parse(text);
    const raw = (data.content || []).map((b) => b.text || "").join("");
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  }

  try {
    const results = await Promise.all(schools.map(fetchSchool));
    console.log("Success, returning", results.length, "schools");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: results }),
    };
  } catch (err) {
    console.log("Caught error:", err.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server error: " + err.message }),
    };
  }
};
