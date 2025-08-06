import React, { useState, useEffect } from 'react';
import './Predictive.css';

interface DonorScore {
  ph: string;
  gift_count: number;
}

const Predictive: React.FC = () => {
  const [medaScores, setMedaScores] = useState<DonorScore[]>([]);
  const [taraScores, setTaraScores] = useState<DonorScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const [medaResponse, taraResponse] = await Promise.all([
          fetch('http://localhost:8000/scores/MEDA'),
          fetch('http://localhost:8000/scores/TARA')
        ]);

        if (!medaResponse.ok || !taraResponse.ok) {
          throw new Error('Failed to fetch scores');
        }

        const medaData = await medaResponse.json();
        const taraData = await taraResponse.json();

        setMedaScores(medaData);
        setTaraScores(taraData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) {
    return <div className="predictive-loading">Loading predictive insights...</div>;
  }

  if (error) {
    return <div className="predictive-error">Error: {error}</div>;
  }

  return (
    <div className="predictive">
      <h2>Predictive Insights</h2>
      <p>Top donors based on federated learning models</p>
      
      <div className="predictive-grid">
        <div className="predictive-section">
          <h3>MEDA Top Donors</h3>
          <div className="scores-table">
            <table>
              <thead>
                <tr>
                  <th>Donor Hash</th>
                  <th>Gift Count</th>
                </tr>
              </thead>
              <tbody>
                {medaScores
                  .sort((a, b) => b.gift_count - a.gift_count)
                  .slice(0, 10)
                  .map((score, index) => (
                    <tr key={index}>
                      <td className="hash-cell">{score.ph.substring(0, 16)}...</td>
                      <td>{score.gift_count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="predictive-section">
          <h3>TARA Top Donors</h3>
          <div className="scores-table">
            <table>
              <thead>
                <tr>
                  <th>Donor Hash</th>
                  <th>Gift Count</th>
                </tr>
              </thead>
              <tbody>
                {taraScores
                  .sort((a, b) => b.gift_count - a.gift_count)
                  .slice(0, 10)
                  .map((score, index) => (
                    <tr key={index}>
                      <td className="hash-cell">{score.ph.substring(0, 16)}...</td>
                      <td>{score.gift_count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictive; 