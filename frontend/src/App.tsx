import { useEffect, useState } from 'react'

type ApiResponse = {
  message: string
  deployment: string
}

export default function App() {
  const [message, setMessage] = useState('Loading...')
  const [deployment, setDeployment] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/message`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`API request failed with statuscode: ${res.status}`)
        }
        return (await res.json()) as ApiResponse
      })
      .then((data) => {
        setMessage(data.message)
        setDeployment(data.deployment)
      })
      .catch((err: Error) => {
        setError(err.message)
      })
  }, [])

  return (
    <main className="container">
      <div className="card">
        <p className="eyebrow">Codespaces starter</p>
        <h1>React + FastAPI</h1>
        <p className="lead">A tiny frontend and backend pair that runs cleanly in containers.</p>

        <div className="panel">
          <h2>Backend response</h2>
          {error ? (
            <p className="error">Error: {error}</p>
          ) : (
            <>
              <p><strong>Message:</strong> {message}</p>
              <p><strong>Note:</strong> {deployment}</p>
            </>
          )}
        </div>

        <div className="grid">
          <div className="mini-card">
            <h3>Frontend</h3>
            <p>Vite + React + TypeScript</p>
          </div>
          <div className="mini-card">
            <h3>Backend</h3>
            <p>FastAPI + Uvicorn</p>
          </div>
          <div className="mini-card">
            <h3>Deploy</h3>
            <p>Each ships with its own Dockerfile</p>
          </div>
        </div>
      </div>
    </main>
  )
}
