import { useEffect, useState } from 'react';

export default function Subscription() {
  const [status, setStatus] = useState('Loading...');
  const sessionId = 'cs_test_a1g6zxIJqBuh0q77zqOLJtQquyk6LmYPuhdndIMFFTBtNO4drqCaopWZuz';

  useEffect(() => {
    fetch(`https://myinnertune-3ads0uhsu-tobiaswedler-2383s-projects.vercel.app/api/verify-session?session_id=${sessionId}&x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=12345678901234567890123456789009`)
      .then(res => res.json())
      .then(data => setStatus(data.message || 'Error'))
      .catch(() => setStatus('Error'));
  }, [sessionId]);

  return <div>Subscription Status: {status}</div>;
}