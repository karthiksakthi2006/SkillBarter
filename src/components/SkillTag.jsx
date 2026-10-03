export default function SkillTag({ label, sublabel, onRemove, color = 'teach' }) {
  return (
    <span className={`skill-tag skill-tag--${color}`}>
      {label}
      {sublabel && <em>{sublabel}</em>}
      {onRemove && (
        <button type="button" className="skill-tag__remove" onClick={onRemove} aria-label={`Remove ${label}`}>
          ×
        </button>
      )}
    </span>
  );
}
