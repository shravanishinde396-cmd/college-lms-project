import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';

export default function TeacherSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get('/assignments/submissions/all');
      setSubmissions(res.data?.submissions || []);
    } catch (err) {
      console.error('Submissions page error:', err);
      setError(err.response?.data?.message || 'Failed to load submissions.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGrade = async (submissionId) => {
    const marks = prompt('Enter marks');
    if (marks === null || marks === '') return;

    const feedback = prompt('Enter feedback') || '';

    try {
      await api.put(`/assignments/submissions/${submissionId}/grade`, {
        marks: Number(marks),
        feedback
      });
      fetchSubmissions();
    } catch (err) {
      console.error('Grade error:', err);
      alert(err.response?.data?.message || 'Failed to grade submission.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Submissions"
        subtitle="Review and grade student submissions."
      />

      <Card>
        {loading ? (
          <p className="p-4">Loading submissions...</p>
        ) : error ? (
          <p className="p-4 text-red-600">{error}</p>
        ) : submissions.length === 0 ? (
          <p className="p-4 text-slate-500">No submissions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3">Student</th>
                  <th className="p-3">Assignment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Marks</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s._id} className="border-b">
                    <td className="p-3">{s.student?.name || '-'}</td>
                    <td className="p-3">{s.assignment?.title || '-'}</td>
                    <td className="p-3">{s.status || 'submitted'}</td>
                    <td className="p-3">{s.marks ?? '-'}</td>
                    <td className="p-3">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => handleGrade(s._id)}
                      >
                        Grade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}