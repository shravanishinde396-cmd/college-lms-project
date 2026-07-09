import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">Modern college LMS for project demo</span>
          <h1 className="mt-6 text-5xl font-bold leading-tight">A polished Moodle-type LMS for courses, quizzes, assignments, and dashboards.</h1>
          <p className="mt-5 text-lg text-slate-600">CampusSphere combines admin control, teacher productivity, and student self-service into one modern college platform.</p>
          <div className="mt-8 flex gap-4">
            <Link to="/register" className="btn-primary">Get Started</Link>
            <Link to="/courses" className="btn-secondary">Explore Courses</Link>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-2">
          {['Role-based dashboards', 'Assignment submissions', 'Quiz engine with scoring', 'Attendance and timetable'].map(item => <Card key={item}><p className="font-semibold">{item}</p><p className="mt-2 text-sm text-slate-500">Ready for final-year submission and local deployment.</p></Card>)}
        </motion.div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['Admin Control', 'Manage users, departments, courses, reports, and notices.'],
            ['Teacher Workspace', 'Create content, mark attendance, grade work, and monitor performance.'],
            ['Student Experience', 'Track progress, access materials, submit tasks, and view results.'],
          ].map(([title, desc]) => <Card key={title}><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 text-slate-500">{desc}</p></Card>)}
        </div>
      </section>
    </div>
  );
}
