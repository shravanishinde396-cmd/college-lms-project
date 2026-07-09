import Card from '../ui/Card';

export default function SectionMessage({ title = 'Nothing to show yet', message = '', tone = 'info' }) {
  const toneClass = tone === 'error' ? 'text-red-600' : 'text-slate-500';

  return (
    <Card>
      <h3 className="text-lg font-semibold">{title}</h3>
      {message ? <p className={`mt-2 text-sm ${toneClass}`}>{message}</p> : null}
    </Card>
  );
}
