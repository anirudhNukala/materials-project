const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require("openai");
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Dynamically generate the request content based on the scenario
const generateRequestContent = (scenario, alloyDescription) => {
    if (scenario === "properties") {
        return `
        You are a materials science assistant. Extract and present the following information about the alloy "${alloyDescription}" in a structured JSON format:

        1. Name of the alloy
        2. Primary elements
        3. Composition of each element (in percentage)
        4. Density (in g/cm³)
        5. Melting point (in °C)
        6. Tensile strength (in MPa)

        Return the information as a JSON object with the following structure:
        {
            "name": "Alloy Name",
            "elements": ["Element1", "Element2", ...],
            "composition": {
                "Element1": "Percentage",
                "Element2": "Percentage"
            },
            "density": "Density Value",
            "melting_point": "Melting Point Value",
            "tensile_strength": "Tensile Strength Value"
        }

        Only return valid JSON. Do not include any additional explanations or text.
        `;
    } else if (scenario === "plot") {
        return `
        You are a materials science assistant. Provide data for plotting the stress-strain curve for the alloy "${alloyDescription}". Include the following information:

        1. A list of strain values (in percentages or decimals)
        2. Corresponding stress values (in MPa)

        Return the information as a JSON object with the following structure:
        {
            "alloy_name": "Alloy Name",
            "stress_strain_curve": [
                {"strain": "Strain Value 1", "stress": "Stress Value 1"},
                {"strain": "Strain Value 2", "stress": "Stress Value 2"},
                ...
            ]
        }

        Only return valid JSON. Do not include any additional explanations or text.
        `;
    } else {
        throw new Error('Invalid scenario');
    }
};

app.post('/generate-alloy-json', async (req, res) => {
    try {
        const { alloyDescription, scenario } = req.body;

        console.log('Received alloyDescription:', alloyDescription);
        console.log('Received scenario:', scenario);

        if (!alloyDescription) {
            return res.status(400).json({ error: 'Alloy description is required and cannot be empty.' });
        }

        const prompt = generateRequestContent(scenario, alloyDescription);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a materials science assistant." },
                { role: "user", content: prompt },
            ],
        });

        res.json({ data: completion });

    } catch (error) {
        console.error('Error generating alloy data:', error);
        res.status(500).json({ error: 'Error generating alloy data' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
