import './SubmitButton.css'

function SubmitButton({ disabled, loading }) {
  return (
    <button 
      type="submit" 
      className="submit-btn" 
      disabled={disabled || loading}
    >
      {loading ? 'Submitting...' : 'Submit'}
    </button>
  )
}

export default SubmitButton