'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const withAuth = (Component) => {
  return function Authenticated(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/');
      } else {
        setLoading(false); // Show the page only after auth is confirmed
      }
    }, [router]);

    if (loading) {
      return <div className="p-4 text-center text-gray-600 mt-5">Checking authentication...</div>;
    }

    return <Component {...props} />;
  };
};

export default withAuth;
