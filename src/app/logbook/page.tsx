"use client";

import { useEffect, useState } from "react";

type Status =
  | "Pending Review"
  | "Approved"
  | "Rejected"
  | "Revision Requested";

type Activity = {
  id: number;
  date: string;
  title: string;
  description: string;
  learning: string;
  skills: string;
  hours: number;
  challenges: string;
  category: string;
  evidence: string;
  status: Status;
  feedback: string;
};

const STORAGE_KEY = "siwesflow-activities";

export default function LogbookPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [category, setCategory] = useState("Coding");
  const [fileName, setFileName] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [completionSubmitted, setCompletionSubmitted] = useState(false);
  const [experienceVerified, setExperienceVerified] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore activities after refreshws.
  useEffect(() => {
    try {
      const savedActivities = window.localStorage.getItem(STORAGE_KEY);
      if (savedActivities) {
        const parsed: Activity[] = JSON.parse(savedActivities);
        if (Array.isArray(parsed)) setActivities(parsed);
      }
    } catch {
      // If stored data is invalid or unavailable.
      setActivities([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    } catch {
      // Storage may be unavailable or full.
    }
  }, [activities, isLoaded]);

  const totalActivities = activities.length;
  const totalHours = activities.reduce((sum, item) => sum + item.hours, 0);
  const pendingCount = activities.filter(
    (item) => item.status === "Pending Review"
  ).length;
  const approvedCount = activities.filter(
    (item) => item.status === "Approved"
  ).length;
  const rejectedCount = activities.filter(
    (item) => item.status === "Rejected"
  ).length;
  const revisionCount = activities.filter(
    (item) => item.status === "Revision Requested"
  ).length;
  const attentionCount = rejectedCount + revisionCount;

  const selectedActivity = activities.find((item) => item.id === selectedId);
  const allApproved =
    activities.length > 0 && approvedCount === activities.length;
  const progress =
    totalActivities === 0
      ? 0
      : Math.round((approvedCount / totalActivities) * 100);

  // A week counts as completed when it has at least one activity and
  // every activity recorded in that week has been approved.
  const weekGroups = activities.reduce<Record<string, Activity[]>>(
    (groups, activity) => {
      const weekKey = getWeekKey(activity.date);
      if (!weekKey) return groups;
      if (!groups[weekKey]) groups[weekKey] = [];
      groups[weekKey].push(activity);
      return groups;
    },
    {}
  );
  const weeksCompleted = Object.values(weekGroups).filter(
    (weekActivities) =>
      weekActivities.length > 0 &&
      weekActivities.every((activity) => activity.status === "Approved")
  ).length;

  function addActivity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const hours = Number(data.get("hours") || 0);
    const date = String(data.get("date") || "");
    const title = String(data.get("title") || "").trim();
    const description = String(data.get("description") || "").trim();
    const learning = String(data.get("learning") || "").trim();
    const skills = String(data.get("skills") || "").trim();
    const otherCategory = String(data.get("otherCategory") || "").trim();

    // Extra checks beyond the browser's required-field validation.
    if (!date || !title || !description || !learning || !skills) {
      window.alert("Please complete all required activity fields.");
      return;
    }
    if (!Number.isFinite(hours) || hours < 1 || hours > 24) {
      window.alert("Hours worked must be between 1 and 24.");
      return;
    }
    if (category === "Other" && !otherCategory) {
      window.alert("Please pck the activity category.");
      return;
    }

    const activity: Activity = {
      id: Date.now(),
      date,
      title,
      description,
      learning,
      skills,
      hours,
      challenges: String(data.get("challenges") || "").trim(),
      category: category === "Other" ? otherCategory : category,
      evidence: fileName,
      status: "Pending Review",
      feedback: "Your activity is awaiting supervisor review.",
    };

    setActivities((previous) => [activity, ...previous]);
    setCompletionSubmitted(false);
    setExperienceVerified(false);
    setSelectedId(null);
    form.reset();
    setCategory("Coding");
    setFileName("");
  }

  function updateStatus(id: number, status: Status) {
    const feedback: Record<Status, string> = {
      "Pending Review": "Awaiting supervisor review.",
      Approved: "Activity approved .",
      Rejected: "Activity rejected . Please review it.",
      "Revision Requested":
        "Revision requested . Please update the activity.",
    };

    setActivities((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status, feedback: feedback[status] } : item
      )
    );
    setCompletionSubmitted(false);
    setExperienceVerified(false);
  }

  function requestCompletion() {
    if (allApproved) {
      setCompletionSubmitted(true);
      setExperienceVerified(false);
    }
  }

  function getStatusClass(status: Status) {
    if (status === "Approved") return "bg-green-100 text-green-800";
    if (status === "Rejected") return "bg-red-100 text-red-800";
    if (status === "Revision Requested")
      return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800";
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-blue-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Digital Logbook
          </h1>
          <p className="mt-2 text-blue-600">
            Record your activities, track your progress.
          </p>
        </header>

        <section>
          <h2 className="mb-4 text-xl font-bold">Dashboard Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total Activities" value={totalActivities} />
            <StatCard label="Total Hours" value={totalHours} />
            <StatCard label="Pending Activities" value={pendingCount} />
            <StatCard label="Approved Activities" value={approvedCount} />
            <StatCard label="Rejected Activities" value={rejectedCount} />
            <StatCard label="Weeks Completed" value={weeksCompleted} />
          </div>
          <div className="mt-4 rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Review Summary</h3>
            <p className="mt-2 text-sm text-blue-600">
              Rejected or revision requested: {attentionCount}
            </p>
            <p className="mt-1 text-sm text-blue-600">
              Revision requests: {revisionCount}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold">Add New Activity</h2>
          <p className="mt-1 text-sm text-blue-500">
            Enter the details of your SIWES activity.
          </p>

          <form onSubmit={addActivity} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField label="Activity Date">
                <input
                  name="date"
                  type="date"
                  required
                  max={new Date().toISOString().slice(0, 10)}
                  className="input-field w-full rounded-lg 
                  border border-blue-200 bg-white p-3 text-blue-700 outline-none
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-100"  
                />
              </FormField>
              <FormField label="Activity Title">
                <input
                  name="title"
                  required
                  maxLength={120}
                  placeholder="e.g. Built a login page"
                  className="input-field w-full rounded-lg border
                   border-blue-600 bg-white p-3 text-blue-700 outline-none 
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
              <FormField label="Category">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="input-field w-full rounded-lg 
                  border border-blue-600 bg-white p-3 text-blue-700 outline-none 
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Coding">Coding</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Training">Training</option>
                  <option value="Research">Research</option>
                  <option value="Other">Other</option>
                </select>
              </FormField>
              {category === "Other" && (
                <FormField label="Specify Category">
                  <input
                    name="otherCategory"
                    required
                    maxLength={60}
                    placeholder="Enter category"
                    className="input-field w-full rounded-lg 
                    border border-blue-600 bg-white p-3 text-blue-700 outline-none 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </FormField>
              )}
              <FormField label="Hours Spent">
                <input
                  name="hours"
                  type="number"
                  min="1"
                  max="24"
                  step="0.5"
                  required
                  placeholder="e.g. 4"
                  className="input-field w-full rounded-lg border 
                  border-blue-200 bg-white p-3 text-blue-700 outline-none 
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
              <FormField label="Skills Practised">
                <input
                  name="skills"
                  required
                  maxLength={250}
                  placeholder="e.g. HTML, CSS, teamwork"
                  className="input-field w-full rounded-lg
                   border border-blue-200 bg-white p-3 text-blue-700 outline-none 
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
            </div>

            <FormField label="Activity Description">
              <textarea
                name="description"
                required
                maxLength={3000}
                rows={3}
                placeholder="Describe what you worked on"
                className="input-field w-full rounded-lg border
                 border-blue-600 bg-white p-3 text-blue-700 outline-none 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </FormField>
            <FormField label="What I Learned">
              <textarea
                name="learning"
                required
                maxLength={3000}
                rows={3}
                placeholder="Explain what you learned..."
                className="input-field w-full rounded-lg border border-blue-200 bg-white p-3 text-blue-700 outline-none 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </FormField>
            <FormField label="Challenges Faced">
              <textarea
                name="challenges"
                maxLength={2000}
                rows={2}
                placeholder="Describe any challenges..."
                className="input-field w-full rounded-lg border 
                border-blue-200 bg-white p-3 text-blue-700 
                outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </FormField>
            <FormField label="upload Evidence">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    setFileName("");
                    return;
                  }
                  const allowedTypes = [
                    "application/pdf",
                    "image/jpeg",
                    "image/png",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  ];
                  const allowedExtensions = /\.(pdf|jpe?g|png|docx?)$/i;
                  if (
                    (file.type && !allowedTypes.includes(file.type)) ||
                    !allowedExtensions.test(file.name)
                  ) {
                    window.alert("Choose a PDF, JPG, PNG, DOC, or DOCX file.");
                    event.target.value = "";
                    setFileName("");
                    return;
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    window.alert("The file must be 10 MB or smaller.");
                    event.target.value = "";
                    setFileName("");
                    return;
                  }
                  setFileName(file.name);
                }}
                className="block w-full rounded-lg border p-3 text-sm"
              />
              {fileName && (
                <p className="mt-2 text-sm text-green-700">
                  Selected: {fileName}
                </p>
              )}
              <p className="mt-1 text-xs text-blue-500">
                Maximum size: 10 MB.
              </p>
            </FormField>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 sm:w-auto"
            >
              Save Activity
            </button>
          </form>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold">Activity History</h2>
          <p className="mt-1 text-sm text-blue-500">
            View your activities and their current review status.
          </p>

          {activities.length === 0 ? (
            <div className="mt-5 rounded-lg bg-gray-50 p-8 text-center">
              <p className="font-medium">No activities yet</p>
              <p className="mt-1 text-sm text-blue-500">
                Activities you save will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {activities.map((activity) => (
                <article
                  key={activity.id}
                  className="rounded-xl border p-4 sm:p-5"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {activity.title}
                      </h3>
                      <p className="mt-1 text-sm text-blue-500">
                        {activity.date} · {activity.category} · {activity.hours}{" "}
                        hour(s)
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        activity.status
                      )}`}
                    >
                      {activity.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-blue-600">
                    {activity.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedId(activity.id)}
                    className="mt-4 rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    View Details
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {selectedActivity && (
          <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Activity Details</h2>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <Detail label="Title" value={selectedActivity.title} />
              <Detail label="Date" value={selectedActivity.date} />
              <Detail label="Category" value={selectedActivity.category} />
              <Detail
                label="Description"
                value={selectedActivity.description}
              />
              <Detail
                label="What I Learned"
                value={selectedActivity.learning}
              />
              <Detail label="Skills" value={selectedActivity.skills} />
              <Detail label="Hours" value={String(selectedActivity.hours)} />
              <Detail
                label="Challenges"
                value={selectedActivity.challenges || "None provided"}
              />
              <Detail
                label="Evidence"
                value={selectedActivity.evidence || "No file selected"}
              />
            </div>

            <div className="mt-6 rounded-xl bg-blue-50 p-5">
              <h3 className="font-bold">Supervisor Review</h3>
              <p className="mt-2 text-sm">
                Current status: {selectedActivity.status}
              </p>
              <p className="mt-2 text-sm text-blue-700">
                Feedback: {selectedActivity.feedback}
              </p>
              <p className="mt-4 text-xs text-blue-600">
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(selectedActivity.id, "Approved")
                  }
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(selectedActivity.id, "Rejected")
                  }
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(selectedActivity.id, "Revision Requested")
                  }
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  Request Revision
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(selectedActivity.id, "Pending Review")
                  }
                  className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-white"
                >
                  Reset Status
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold">Logbook Completion</h2>
          <p className="mt-2 text-sm text-blue-600">
            Your progress is based on the activities approved.
          </p>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm">
              <span>Approved activities</span>
              <span>
                {approvedCount} of {totalActivities}
              </span>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-gray-200"
              role="progressbar"
              aria-label="Approved activity progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-blue-600">{progress}% approved</p>
          </div>

          <button
            type="button"
            onClick={requestCompletion}
            disabled={!allApproved}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Request Logbook Completion
          </button>

          {!allApproved && (
            <p className="mt-2 text-sm text-blue-500">
              Add at least one activity and approve all activities to enable
              this action.
            </p>
          )}
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold">Verified Experience Status</h2>
          <p className="mt-2 text-sm text-blue-600">
            This demonstration shows the status of your completion workflow.
          </p>

          <div className="mt-4">
            <span
              className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${
                experienceVerified
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-blue-700"
              }`}
            >
              {experienceVerified ? "Verified " : "Not Verified"}
            </span>
          </div>

          <button
            type="button"
            disabled={!completionSubmitted}
            onClick={() => setExperienceVerified(true)}
            className="mt-4 rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
          >
            Mark Experience Verified 
          </button>

          
        </section>
      </div>
    </main>
  );
}

function getWeekKey(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  // ISO week: Monday through Sunday.
  const day = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - day);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${date.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-blue-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm">{value}</p>
    </div>
  );
}    