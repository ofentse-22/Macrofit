import { useState } from "react";

function imageCandidates(src, name) {
  const sources = Array.isArray(src) ? src : [src];
  const candidates = sources.filter(Boolean).flatMap((source) => {
    const path = String(source);
    const match = path.match(/^(.*\/)([^/]+?)(\.[^./]+)$/);
    if (!match) return [path];
    const [, directory, filename, extension] = match;
    const normalizedName = String(name || filename)
      .replace(/\s+variation\s*\d+$/i, "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "");
    return [
      path,
      `${directory}${filename.toLowerCase()}${extension.toLowerCase()}`,
      `${directory}${normalizedName}${extension.toLowerCase()}`,
      `${directory}${normalizedName.toLowerCase()}${extension.toLowerCase()}`,
    ];
  });
  return [...new Set(candidates)];
}

export default function ExerciseImage({ src, name, className = "exercise-image" }) {
  const candidates = imageCandidates(src, name);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const initial = String(name || "E").trim().charAt(0).toUpperCase() || "E";
  const currentSrc = candidates[candidateIndex];

  if (!currentSrc) {
    return <div className={`${className} exercise-image-placeholder`} role="img" aria-label={`${name || "Exercise"} image unavailable`}><span aria-hidden="true">{initial}</span></div>;
  }

  return <img src={currentSrc} alt={name} className={className} onError={() => setCandidateIndex((index) => index + 1 < candidates.length ? index + 1 : candidates.length)} />;
}
