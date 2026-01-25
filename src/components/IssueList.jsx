// src/features/survey-ui/IssueList.jsx

import IssueSlider from "./IssueSlider";

const issues = [
  { id: "military_cartels", prompt: "I believe that..." },
  { id: "education_funding", prompt: "Florida should..." }
];

function IssueList({ ratings, onRatingChange }) {
  return (
    <div>
      {issues.map((issue) => (
        <IssueSlider
          key={issue.id}
          issueId={issue.id}
          prompt={issue.prompt}
          value={surveyResponses[issue.id] || 0}
          onChange={onRatingChange}
        />
      ))}
    </div>
  );
}

export default IssueList;
