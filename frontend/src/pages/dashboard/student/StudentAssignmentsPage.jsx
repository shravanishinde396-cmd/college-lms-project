import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  useEffect(() => { api.get('/assignments').then(({ data }) => setAssignments(data.assignments)); }, []);
  const submit = async (id) => {
    const text = prompt('Enter short submission note') || 'Submitted from LMS demo';
    await api.post(`/assignments/${id}/submit`, { text });
    alert('Assignment submitted');
  };
  return <div><PageHeader title="Assignments" subtitle="Submit coursework and track deadlines." /><div className="grid gap-4">{assignments.map(a => <Card key={a._id}><div className="flex flex-col justify-between gap-4 lg:flex-row"><div><h3 className="text-xl font-semibold">{a.title}</h3><p className="mt-2 text-slate-500">{a.description}</p><p className="mt-3 text-sm">Due: {new Date(a.dueDate).toLocaleString()}</p></div><div className="flex items-center"><Button onClick={()=>submit(a._id)}>Submit</Button></div></div></Card>)}</div></div>;
}
