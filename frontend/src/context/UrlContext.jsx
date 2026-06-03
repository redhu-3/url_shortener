import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const UrlContext = createContext();

export const UrlProvider = ({ children }) => {
  const [urls, setUrls] = useState([]);
  const [fetching, setFetching] = useState(false);
  const { user } = useAuth();

  const fetchUrls = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    try {
      const { data } = await api.get('/api/url/user');
      setUrls(data);
    } catch (err) {
      console.error('Failed to fetch URLs:', err);
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUrls();
    } else {
      setUrls([]);
    }
  }, [user, fetchUrls]);

  const addNewUrl = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
  };

  const updateUrl = (updatedUrl) => {
    setUrls((prev) => prev.map((u) => (u._id === updatedUrl._id ? updatedUrl : u)));
  };

  const deleteUrlState = (id) => {
    setUrls((prev) => prev.filter((u) => u._id !== id));
  };

  const toggleFavourite = async (id, currentStatus) => {
    try {
      const { data } = await api.put(`/api/url/${id}`, { isFavourite: !currentStatus });
      updateUrl(data);
      return data;
    } catch (err) {
      console.error('Failed to toggle favourite:', err);
      throw err;
    }
  };

  const pingUrl = async (id) => {
    try {
      const { data } = await api.post(`/api/url/${id}/ping`);
      setUrls((prev) =>
        prev.map((u) => {
          if (u._id === id) {
            return { ...u, pingResult: data };
          }
          return u;
        })
      );
      return data;
    } catch (err) {
      console.error('Failed to ping URL:', err);
      throw err;
    }
  };

  return (
    <UrlContext.Provider
      value={{
        urls,
        fetching,
        fetchUrls,
        addNewUrl,
        updateUrl,
        deleteUrlState,
        toggleFavourite,
        pingUrl,
        setUrls,
      }}
    >
      {children}
    </UrlContext.Provider>
  );
};

export const useUrls = () => useContext(UrlContext);
