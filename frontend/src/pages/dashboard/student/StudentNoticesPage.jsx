import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
export default function StudentNoticesPage() {
  const [notices, setNotices] = useState([]);
  useEffect(()=>{ api.get('/notices').then(({ data }) => setNotices(data.notices)); }, []);
  return <div><PageHeader title="Announcements" subtitle="Stay updated with department and college notices." /><div className="grid gap-4">{notices.map(n => <Card key={n._id}><h3 className="font-semibold">{n.title}</h3><p className="mt-2 text-slate-500">{n.message}</p></Card>)}</div></div>;
}
