import { useState, useEffect } from "react";
import { adminStatsApi } from "../utils/quizStore";

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [overview, popular] = await Promise.all([
          adminStatsApi.getOverview(),
          adminStatsApi.getPopular(10)
        ]);
        setStats({ overview, popular });
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Quiz Analytics</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Questions</p>
          <p className="text-2xl font-bold">{stats?.overview?.totalQuestions || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Attempts</p>
          <p className="text-2xl font-bold">{stats?.overview?.totalAttempts || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Courses</p>
          <p className="text-2xl font-bold">{stats?.overview?.totalCourses || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Subjects</p>
          <p className="text-2xl font-bold">{stats?.overview?.totalSubjects || 0}</p>
        </div>
      </div>

      {/* Popular Subjects */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4">🔥 Most Popular Subjects</h2>
        {stats?.popular?.length === 0 ? (
          <p className="text-gray-500">No data yet</p>
        ) : (
          <div className="space-y-3">
            {stats?.popular?.map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2">
                <div>
                  <span className="font-medium">{item.subjectName}</span>
                  <span className="text-sm text-gray-500 ml-2">({item.courseName})</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{item.attempts} attempts</span>
                  <span className="text-sm font-semibold text-emerald-600">{item.avgPercentage}% avg</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}