import { useState } from 'react'
import './App.css'
import { db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
//import IssueList from "./features/survey-ui/IssueList";
//import IssueSlider from "./features/survey-ui/IssueSlider";

const API_BASE = "http://127.0.0.1:5000"

const questions = [
  { id: "issue_id_1", text: "The government should increase funding for public transportation in Pinellas County." },
  { id: "issue_id_2", text: "Local businesses should receive tax incentives to create more jobs in Florida." },
  { id: "issue_id_3", text: "The state should invest more in renewable energy sources." },
  { id: "issue_id_4", text: "Public schools should receive increased funding for technology and resources." },
  { id: "issue_id_5", text: "The minimum wage in Florida should be raised to match the cost of living." },
  { id: "issue_id_6", text: "Local law enforcement should receive more funding for community programs." },
  { id: "issue_id_7", text: "The county should prioritize affordable housing development." },
  { id: "issue_id_8", text: "Environmental regulations should be strengthened to protect Florida's coastlines." },
  { id: "issue_id_9", text: "Healthcare services should be more accessible in rural areas of the county." },
  { id: "issue_id_10", text: "The government should provide more support for small business owners." },
  { id: "issue_id_11", text: "Property taxes should be restructured to benefit long-term residents." },
  { id: "issue_id_12", text: "The county should expand mental health services and resources." },
  { id: "issue_id_13", text: "Infrastructure spending should prioritize road maintenance and repairs." },
  { id: "issue_id_14", text: "Local government should increase transparency in budget decisions." },
  { id: "issue_id_15", text: "The state should provide more resources for disaster preparedness." }
]

function App() {
  const [answers, setAnswers] = useState(() => {
    let initial = {}
    questions.forEach((q) => {
      initial[q.id] = 5
    })
    return initial
  })

  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSlider(issueId, value) {
    setAnswers(prev => ({
      ...prev,
      [issueId]: Number(value)
    }))
    setTouched(prev => ({
      ...prev,
      [issueId]: true
    }))
  }

  const allTouched = questions.every((q) => touched[q.id])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    // Create the response object in the exact format specified
    const data = {
      county: "Pinellas",
      responses: answers,
      submittedAt: serverTimestamp()
    }

    try {
      console.log('Submitting:', data)
      await addDoc(collection(db, 'surveys'), data)
      setSubmitted(true)
    } catch (err) {
      console.error('Error submitting survey:', err)
      alert('Error submitting survey. Please try again.')
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="container">
        <div className="thankyou">
          <h1>Thank You!</h1>
          <p>Your responses have been recorded.</p>
          <p>Thank you for participating in the Pinellas County community survey.</p>
          <button onClick={() => {
            setSubmitted(false)
            setTouched({})
            let reset = {}
            questions.forEach((q) => reset[q.id] = 5)
            setAnswers(reset)
          }}>
            Take Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header>
        <h1>Community Issues Survey</h1>
        <span className="badge">Pinellas County, Florida</span>
        <p>Rate your agreement with each statement from 1-10</p>
        <div className="scale-info">
          <span>1 = Strongly Disagree</span>
          <span>10 = Strongly Agree</span>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <div className="question-box" key={question.id}>
            <p><strong>{index + 1}.</strong> {question.text}</p>
            <input
              type="range"
              min="1"
              max="10"
              value={answers[question.id]}
              onChange={(e) => handleSlider(question.id, e.target.value)}
            />
            <div className="value-bubble">{answers[question.id]}</div>
            <div className="tick-marks">
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
              <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
            </div>
          </div>
        ))}

        <button type="submit" className="submit-btn" disabled={!allTouched || loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>

        {!allTouched && (
          <p className="hint">Please answer all questions to submit</p>
        )}
      </form>
    </div>
  )
}

export default App
