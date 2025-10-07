import { useEffect, useState } from 'react';

function UseCountryDetector() {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(import.meta.env.VITE_PUBLIC_IP_LOC_API ?? '')
      .then(response => response.json())
      .then(data => {
        setCountry(data.country_name);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return {
    country,
    countryLoading: loading
  }
}

export default UseCountryDetector;