import { bodyFatRanges } from "../data/bodyFatRanges";

export default function BodyFatGallery({ gender, selectedCategory }) {
  return (
    <div className="body-fat-gallery">
      {bodyFatRanges[gender].map((range) => (
        <div
          className={`body-fat-range ${
            selectedCategory === range.name ? "selected" : ""
          }`}
          key={range.name}
        >
          <span className="range-color" style={{ backgroundColor: range.color }} />
          <div>
            <strong>{range.name}</strong>
            <span>
              {range.min}% - {range.max === 100 ? "100+" : `${range.max}`}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
