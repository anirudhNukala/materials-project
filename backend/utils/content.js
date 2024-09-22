const requestContent = `
You are a materials science assistant. Extract and present the following information about the alloy in a structured JSON format:

1. Name of the alloy
2. Primary elements
3. Composition of each element (in percentage)
4. Density (in g/cm³)
5. Melting point (in °C)
6. Tensile strength (in MPa)

Return the information as a JSON object with the following structure:

Only return valid JSON. Do not include any additional explanations or text.
`

module.exports = { requestContent };

// {
//   "name": "Alloy Name",
//   "elements": ["Element1", "Element2"],
//   "composition": {
//     "Element1": "Percentage",
//     "Element2": "Percentage"
//   },
//   "density": "value in g/cm³",
//   "melting_point": "value in °C",
//   "tensile_strength": "value in MPa"
// }
