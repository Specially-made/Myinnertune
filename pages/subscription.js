import { useEffect, useState } from 'react';

export default function Subscription() {
  const [status, setStatus] = useState('Loading...');
  const [details, setDetails] = useState({});
  const sessionId = 'cs_test_a1g6zxIJqBuh0q77zqOLJtQquyk6LmYPuhdndIMFFTBtNO4drqCaopWZuz'; // Test session ID

  useEffect(() => {
    fetch(`https://myinnertune-gfqiqbgi2-tobiaswedler-2383s-projects.vercel.app/api/verify-session?session_id=${sessionId}&x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=12345678901234567890123456789009`)
      .then(res => res.json())
      .then(data => {
        setStatus(data.message || 'Error');
        setDetails(data.session || {});
      })
      .catch(() => setStatus('Error'));
  }, [sessionId]);

  return (
    <div>
      <h1>Subscription Status: {status}</h1>
      {details.id && <p>Session ID: {details.id}</p>}
      {details.subscription && <p>Subscription ID: {details.subscription}</p>}
    </div>
  );
}