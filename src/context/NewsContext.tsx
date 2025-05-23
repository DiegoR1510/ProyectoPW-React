import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export interface NewsArticle {
  id: number;
  title: string;
  body: string;
  image?: string;
}

interface NewsContextType {
  news: NewsArticle[];
  addNews: (article: Omit<NewsArticle, 'id'>) => void;
  editNews: (id: number, article: Omit<NewsArticle, 'id'>) => void;
  deleteNews: (id: number) => void;
}

export const NewsContext = createContext<NewsContextType>({
  news: [],
  addNews: () => {},
  editNews: () => {},
  deleteNews: () => {},
});

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [news, setNews] = useState<NewsArticle[]>(() => {
    const stored = localStorage.getItem('news');
    return stored ? JSON.parse(stored) : [
      {
        id: 1,
        title: '¡GTA 6 revela su primer tráiler oficial!',
        body: 'Rockstar Games ha lanzado el esperado primer tráiler de Grand Theft Auto VI, mostrando una nueva ciudad y personajes. La comunidad está emocionada por su lanzamiento en 2025.',
        image: '/assets/carrusel/gta6.jpg'
      },
      {
        id: 2,
        title: 'FC25 presenta innovaciones en el modo carrera',
        body: 'EA Sports ha anunciado nuevas características para el modo carrera en FC25, incluyendo un sistema de entrenamiento mejorado y transferencias más realistas.',
        image: '/assets/carrusel/fc25.jpg'
      },
      {
        id: 3,
        title: 'God of War: Ragnarok recibe actualización gratuita',
        body: 'Santa Monica Studio lanza una actualización gratuita para God of War: Ragnarok, agregando nuevos desafíos y contenido para los fans de Kratos.',
        image: '/assets/carrusel/godofwar.png'
      }
    ];
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    localStorage.setItem('news', JSON.stringify(news));
  }, [news]);

  const addNews = (article: Omit<NewsArticle, 'id'>) => {
    if (user?.role !== 'admin') return;
    setNews(prev => [
      { ...article, id: Date.now() },
      ...prev
    ]);
  };

  const editNews = (id: number, article: Omit<NewsArticle, 'id'>) => {
    if (user?.role !== 'admin') return;
    setNews(prev => prev.map(n => n.id === id ? { ...n, ...article } : n));
  };

  const deleteNews = (id: number) => {
    if (user?.role !== 'admin') return;
    setNews(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NewsContext.Provider value={{ news, addNews, editNews, deleteNews }}>
      {children}
    </NewsContext.Provider>
  );
}; 