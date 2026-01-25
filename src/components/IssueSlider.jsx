import './IssueSlider.css'

function IssueSlider({ issueId, value, onChange }) {
  function handleChange(e) {
    onChange(Number(e.target.value))
  }

  function handleTrackClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newValue = Math.round(percent * 9) + 1
    onChange(Math.min(10, Math.max(1, newValue)))
  }

  return (
    <div className="slider-wrapper">
      <div className="slider-track" onClick={handleTrackClick}>
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={handleChange}
          id={`slider-${issueId}`}
        />
      </div>
      <div className="slider-value">{value}</div>
      <div className="slider-ticks">
        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
        <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
      </div>
    </div>
  )
}

export default IssueSlider