const text = `
Here are your questions:
{
  "questions": [
    {
      "type": "Conceptual",
      "question": "TEST"
    }
  ]
}
Hope this helps!`;

const startIndex = text.indexOf("{");
const endIndex = text.lastIndexOf("}");
const jsonString = text.substring(startIndex, endIndex + 1);
const parsedData = JSON.parse(jsonString);

if (parsedData.questions && Array.isArray(parsedData.questions)) {
  parsedData.questions = parsedData.questions.map((question) => ({
    ...question,
    answer: "",
    review: "",
  }));
}
console.log(parsedData.questions.length);
