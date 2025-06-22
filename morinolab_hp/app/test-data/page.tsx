'use client';

import { useState, useEffect } from 'react';
import {
  loadNews,
  loadTeamMembers,
  loadPublications,
  loadAwards,
} from '@/lib/client-content-loader';

export default function TestDataPage() {
  const [newsData, setNewsData] = useState<any[]>([]);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [publicationsData, setPublicationsData] = useState<any[]>([]);
  const [awardsData, setAwardsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const testAllData = async () => {
      setLoading(true);
      const newErrors: string[] = [];

      try {
        console.log('Testing news data...');
        const news = await loadNews();
        console.log('News data:', news);
        setNewsData(news);
      } catch (err) {
        const error = `News error: ${err}`;
        console.error(error);
        newErrors.push(error);
      }

      try {
        console.log('Testing team data...');
        const team = await loadTeamMembers();
        console.log('Team data:', team);
        setTeamData(team);
      } catch (err) {
        const error = `Team error: ${err}`;
        console.error(error);
        newErrors.push(error);
      }

      try {
        console.log('Testing publications data...');
        const publications = await loadPublications();
        console.log('Publications data:', publications);
        setPublicationsData(publications);
      } catch (err) {
        const error = `Publications error: ${err}`;
        console.error(error);
        newErrors.push(error);
      }

      try {
        console.log('Testing awards data...');
        const awards = await loadAwards();
        console.log('Awards data:', awards);
        setAwardsData(awards);
      } catch (err) {
        const error = `Awards error: ${err}`;
        console.error(error);
        newErrors.push(error);
      }

      setErrors(newErrors);
      setLoading(false);
    };

    testAllData();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-900 text-white p-8'>
        <h1 className='text-2xl mb-4'>Testing Data Loading...</h1>
        <p>Check console for detailed logs</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white p-8'>
      <h1 className='text-3xl mb-8'>Data Loading Test Results</h1>

      {errors.length > 0 && (
        <div className='bg-red-900 p-4 rounded mb-8'>
          <h2 className='text-xl mb-2'>Errors:</h2>
          <ul>
            {errors.map((error, index) => (
              <li key={index} className='text-red-300'>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='bg-gray-800 p-6 rounded'>
          <h2 className='text-xl mb-4'>News Data ({newsData.length} items)</h2>
          <pre className='text-sm overflow-auto max-h-64'>
            {JSON.stringify(newsData.slice(0, 3), null, 2)}
          </pre>
        </div>

        <div className='bg-gray-800 p-6 rounded'>
          <h2 className='text-xl mb-4'>Team Data ({teamData.length} items)</h2>
          <pre className='text-sm overflow-auto max-h-64'>
            {JSON.stringify(teamData.slice(0, 3), null, 2)}
          </pre>
        </div>

        <div className='bg-gray-800 p-6 rounded'>
          <h2 className='text-xl mb-4'>
            Publications Data ({publicationsData.length} items)
          </h2>
          <pre className='text-sm overflow-auto max-h-64'>
            {JSON.stringify(publicationsData.slice(0, 3), null, 2)}
          </pre>
        </div>

        <div className='bg-gray-800 p-6 rounded'>
          <h2 className='text-xl mb-4'>
            Awards Data ({awardsData.length} items)
          </h2>
          <pre className='text-sm overflow-auto max-h-64'>
            {JSON.stringify(awardsData.slice(0, 3), null, 2)}
          </pre>
        </div>
      </div>

      <div className='mt-8'>
        <p className='text-gray-400'>
          Open browser developer tools to see detailed console logs.
        </p>
      </div>
    </div>
  );
}
