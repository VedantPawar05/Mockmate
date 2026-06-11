const axios = require('axios');
const prompt = `Generate a JSON response containing 2 detailed DSA interview questions tailored to assess a candidate's skills and expertise based on the following criteria: Tech Stack: React Experience Level: Junior Company: Google Job Role: Frontend. Output Format: { "questions": [ { "type": "Conceptual", "technology": "Node.js", "question": "q1" } ] } Important: Return only the JSON format in your response with no extra text or explanations.`;

axios.post(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyDjz_bslzrsZz86ms_IqUSvVnJg8sRYSGg',
  { contents: [{ parts: [{ text: prompt }] }] },
  { headers: { 'Content-Type': 'application/json' } }
).then(res => {
  console.log('--- RESPONSE TEXT ---');
  console.log(res.data.candidates[0].content.parts[0].text);
  console.log('--- END RESPONSE TEXT ---');
}).catch(err => {
  console.error(err.response ? err.response.data : err.message);
});
