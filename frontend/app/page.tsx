"use client";
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './styles/page.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StressStrainData {
  alloy_name: string;
  stress_strain_curve: {
    strain: string;
    stress: string;
  }[];
}

interface MaterialProperties {
  name: string;
  elements: string[];
  composition: {
    [key: string]: string;
  };
  density: number;
  melting_point: number;
  tensile_strength: number;
}

type ResultType = StressStrainData | MaterialProperties | null;

const HomePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [scenario, setScenario] = useState('plot');
  const [result, setResult] = useState<ResultType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuerySubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/generate-alloy-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alloyDescription: query, scenario }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch the result');
      }

      const data = await response.json();
      const content = data.data.choices[0].message.content;

      const jsonContent = content.replace(/```json|```/g, '').trim();

      setResult(JSON.parse(jsonContent));

    } catch (error) {
      setError('An error occurred while generating the response.');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    if (!result || !('stress_strain_curve' in result)) return null;

    const labels = result.stress_strain_curve.map((point: { strain: string }) => point.strain);
    const data = result.stress_strain_curve.map((point: { stress: string }) => point.stress);

    return {
      labels,
      datasets: [
        {
          label: `${(result as StressStrainData).alloy_name} Stress-Strain Curve`,
          data: data,
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 2,
          fill: false,
          tension: 0.1,
        },
      ],
    };
  };

  const renderMaterialProperties = () => {
    if (!result || 'alloy_name' in result) return null;

    const materialProperties = result as MaterialProperties;

    return (
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Material Name</strong></td>
            <td>{materialProperties.name}</td>
          </tr>
          {materialProperties.composition && (
            <tr>
              <td><strong>Composition</strong></td>
              <td>
                {Object.entries(materialProperties.composition).map(([element, percentage]) => (
                  typeof percentage === 'string' ? (
                    <div key={element}>{element}: {percentage}</div>
                  ) : (
                    <div key={element}>{element}: Unknown</div>
                  )
                ))}
              </td>
            </tr>
          )}

          <tr>
            <td><strong>Density</strong></td>
            <td>{materialProperties.density} g/cm³</td>
          </tr>
          <tr>
            <td><strong>Melting Point</strong></td>
            <td>{materialProperties.melting_point} °C</td>
          </tr>
          <tr>
            <td><strong>Tensile Strength</strong></td>
            <td>{materialProperties.tensile_strength} MPa</td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Materials Insight</h1>

      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="Enter your alloy description"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.input}
        />
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          className={styles.select}
        >
          <option value="properties">Material Properties</option>
          <option value="plot">Stress-Strain Curve Data</option>
        </select>
        <button onClick={handleQuerySubmit} className={styles.button} disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {result && scenario === 'plot' && generateChartData() && (
        <div className={styles.resultContainer}>
          <h2>Stress-Strain Curve for {(result as StressStrainData).alloy_name}</h2>
          <Line
            data={generateChartData() || { labels: [], datasets: [] }}
            options={{ responsive: true }}
          />
        </div>
      )}

      {result && scenario === 'properties' && (
        <div className={styles.resultContainer}>
          <h2>Material Properties for {(result as MaterialProperties).name}</h2>
          {renderMaterialProperties()}
        </div>
      )}
    </div>
  );
};

export default HomePage;
