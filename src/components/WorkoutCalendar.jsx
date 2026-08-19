import { useEffect, useState } from "react";
import "./WorkoutCalendar.css";

function getSavedHistory() {
  try {
    return JSON.parse(localStorage.getItem("workoutHistory") || "[]");
  } catch {
    return [];
  }
}

export default function WorkoutCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    const history = getSavedHistory();
    const daysMap = {};

    history.forEach((workout) => {
      const date = new Date(workout.completedAt).toDateString();
      if (!daysMap[date]) {
        daysMap[date] = [];
      }
      daysMap[date].push(workout);
    });

    setWorkoutDays(daysMap);
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getStatusForDay = (dayNumber) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    const dateString = date.toDateString();

    if (workoutDays[dateString] && workoutDays[dateString].length > 0) {
      const completionRatio = workoutDays[dateString][0].completedRatio || 0;
      if (completionRatio === 100) return "completed"; // green
      if (completionRatio > 0) return "partial"; // yellow
      return "missed"; // red
    }

    return "rest"; // grey
  };

  const handleDayClick = (dayNumber) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    const dateString = date.toDateString();

    setSelectedDay(dayNumber);
    setSelectedWorkout(workoutDays[dateString]?.[0] || null);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDay(null);
    setSelectedWorkout(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDay(null);
    setSelectedWorkout(null);
  };

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="workout-calendar-container">
      <div className="calendar-header">
        <h2>Workout Calendar</h2>
        <p>Track your workout consistency</p>
      </div>

      <div className="calendar-wrapper">
        <div className="calendar-section">
          <div className="month-header">
            <button onClick={previousMonth} className="nav-button">
              ←
            </button>
            <h3>{monthName}</h3>
            <button onClick={nextMonth} className="nav-button">
              →
            </button>
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-dot completed"></div>
              <span>Completed</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot partial"></div>
              <span>Partial</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot missed"></div>
              <span>Missed</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot rest"></div>
              <span>Rest</span>
            </div>
          </div>

          <div className="calendar-grid">
            {weekdayLabels.map((label) => (
              <div key={label} className="weekday-label">
                {label}
              </div>
            ))}

            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty"></div>
            ))}

            {days.map((dayNumber) => {
              const status = getStatusForDay(dayNumber);
              const isSelected = selectedDay === dayNumber;

              return (
                <button
                  key={dayNumber}
                  onClick={() => handleDayClick(dayNumber)}
                  className={`calendar-day ${status} ${isSelected ? "selected" : ""}`}
                  title={`${monthName.split(" ")[0]} ${dayNumber}`}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>
        </div>

        {selectedWorkout && (
          <div className="workout-details">
            <h3>Workout Details</h3>
            <div className="details-content">
              <div className="detail-row">
                <span className="label">Date</span>
                <span className="value">
                  {new Date(selectedWorkout.completedAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">Workout</span>
                <span className="value">{selectedWorkout.title}</span>
              </div>

              <div className="detail-row">
                <span className="label">Duration</span>
                <span className="value">
                  {new Date(selectedWorkout.completedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">Exercises</span>
                <span className="value">{selectedWorkout.exerciseCount}</span>
              </div>

              <div className="detail-row">
                <span className="label">Sets Completed</span>
                <span className="value">
                  {selectedWorkout.completedSets} / {selectedWorkout.totalSets}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">Completion Rate</span>
                <div className="value completion-rate">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${selectedWorkout.completedRatio}%` }}
                    ></div>
                  </div>
                  <span className="percentage">{selectedWorkout.completedRatio}%</span>
                </div>
              </div>

              {selectedWorkout.exercises && selectedWorkout.exercises.length > 0 && (
                <div className="exercise-list">
                  <div className="list-label">Exercises</div>
                  <ul>
                    {selectedWorkout.exercises.map((ex, i) => (
                      <li key={i}>{ex.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedWorkout && selectedDay && (
          <div className="workout-details empty">
            <h3>No Workout</h3>
            <p>Rest day or no workout logged for this date.</p>
          </div>
        )}
      </div>

      <div className="calendar-stats">
        <div className="stat-box">
          <div className="stat-value">
            {Object.keys(workoutDays).filter((day) => {
              const ratio = workoutDays[day][0]?.completedRatio || 0;
              return ratio === 100;
            }).length}
          </div>
          <div className="stat-label">Completed Workouts</div>
        </div>

        <div className="stat-box">
          <div className="stat-value">
            {Object.keys(workoutDays).filter((day) => {
              const ratio = workoutDays[day][0]?.completedRatio || 0;
              return ratio > 0 && ratio < 100;
            }).length}
          </div>
          <div className="stat-label">Partial Workouts</div>
        </div>

        <div className="stat-box">
          <div className="stat-value">
            {Object.keys(workoutDays).filter((day) => {
              const ratio = workoutDays[day][0]?.completedRatio || 0;
              return ratio === 0 && workoutDays[day][0];
            }).length}
          </div>
          <div className="stat-label">Missed Workouts</div>
        </div>

        <div className="stat-box">
          <div className="stat-value">
            {((Object.keys(workoutDays).filter((day) => {
              const ratio = workoutDays[day][0]?.completedRatio || 0;
              return ratio === 100;
            }).length /
              Object.keys(workoutDays).length) *
              100 || 0).toFixed(0)}
            %
          </div>
          <div className="stat-label">Completion Rate</div>
        </div>
      </div>
    </div>
  );
}
