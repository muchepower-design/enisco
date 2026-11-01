import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const PriceCalculator = ({ serviceType, params, onPriceFetched }) => {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(null);
  const [message, setMessage] = useState('');
  const [lastFetchedParams, setLastFetchedParams] = useState(null);
  const debounceTimer = useRef(null);

  // Check if all required params are present (non-empty, non-null)
  const areParamsValid = () => {
    if (!params) return false;
    // For flight: airline_id, origin, destination, travel_class
    // For insurance: company_id, vehicle_type, insurance_type, quarters
    if (serviceType === 'flight') {
      return params.airline_id && params.origin && params.destination && params.travel_class;
    } else if (serviceType === 'insurance') {
      return params.company_id && params.vehicle_type && params.insurance_type && params.quarters;
    }
    return false;
  };

  // Compute a unique key from the current params to compare changes
  const getParamsKey = () => {
    if (!params) return null;
    return JSON.stringify(params);
  };

  useEffect(() => {
    // Clear any pending timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    const currentKey = getParamsKey();
    // If params are empty or invalid, reset and exit
    if (!areParamsValid()) {
      setPrice(null);
      setMessage('');
      onPriceFetched(null, null);
      return;
    }

    // If the params haven't changed from last fetch, do nothing
    if (lastFetchedParams === currentKey) {
      return;
    }

    // Debounce: wait 500ms after last change before fetching
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setMessage('');
      try {
        let endpoint = '';
        let body = {};
        if (serviceType === 'flight') {
          endpoint = '/api/pricing/flight';
          body = {
            airline_id: params.airline_id,
            origin: params.origin,
            destination: params.destination,
            travel_class: params.travel_class,
          };
        } else if (serviceType === 'insurance') {
          endpoint = '/api/pricing/insurance';
          body = {
            company_id: params.company_id,
            vehicle_type: params.vehicle_type,
            insurance_type: params.insurance_type,
            quarters: params.quarters,
          };
        } else {
          return;
        }

        const res = await api.post(endpoint, body);
        if (res.data.price_available) {
          setPrice(res.data.amount);
          setMessage('');
          setLastFetchedParams(currentKey);
          onPriceFetched(res.data.amount, null);
        } else {
          setPrice(null);
          setMessage(res.data.message);
          setLastFetchedParams(currentKey);
          onPriceFetched(null, res.data.message);
        }
      } catch (err) {
        console.error('Price fetch error:', err);
        setMessage('Error fetching price');
        onPriceFetched(null, 'Error fetching price');
      } finally {
        setLoading(false);
      }
    }, 500);

    // Cleanup on unmount or dependency change
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, [params, serviceType]); // Re-run when params or serviceType change

  // Reset state if params become invalid (e.g., user clears a field)
  useEffect(() => {
    if (!areParamsValid()) {
      setPrice(null);
      setMessage('');
      setLastFetchedParams(null);
      onPriceFetched(null, null);
    }
  }, [params]);

  return (
    <div className="mt-4 p-4 rounded-xl bg-gray-50 border">
      {loading && <p className="text-gray-600">Checking price...</p>}
      {price !== null && !loading && (
        <p className="text-green-600 font-bold">Price available: ZMW {price}</p>
      )}
      {message && !loading && <p className="text-yellow-600">{message}</p>}
      {!loading && !price && !message && areParamsValid() && (
        <p className="text-gray-400 text-sm">Waiting for price check...</p>
      )}
      {!areParamsValid() && !loading && (
        <p className="text-gray-400 text-sm">Please fill in all required fields to check price.</p>
      )}
    </div>
  );
};

export default PriceCalculator;