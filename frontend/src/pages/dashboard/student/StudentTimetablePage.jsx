import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
export default function StudentTimetablePage() {
  const [entries, setEntries] = useState([]);
  useEffect(()=>{ api.get('/timetable').then(({ data }) => setEntries(data.entries)); }, []);
  return <div><PageHeader title="Timetable" subtitle="Weekly class schedule." /><div className="grid gap-4">{entries.map(e => <Card key={e._id}><p className="font-semibold">{e.day} • {e.startTime} - {e.endTime}</p><p className="text-sm text-slate-500">{e.course?.title} • Room {e.room}</p></Card>)}</div></div>;
}
