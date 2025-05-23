import React, { useContext, useState } from 'react';
import { NewsContext, NewsArticle } from '../context/NewsContext';
import { AuthContext } from '../context/AuthContext';

const emptyForm = { title: '', body: '', image: '' };

type FormType = typeof emptyForm;

const News: React.FC = () => {
  const { news, addNews, editNews, deleteNews } = useContext(NewsContext);
  const { user } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormType>(emptyForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = (article: NewsArticle) => {
    setForm({ title: article.title, body: article.body, image: article.image || '' });
    setEditId(article.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      editNews(editId, form);
    } else {
      addNews(form);
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm(emptyForm);
    setEditId(null);
  };

  return (
    <div className="container mt-4">
      <h2>Noticias</h2>
      {user?.role === 'admin' && (
        <button className="btn btn-success mb-3" onClick={handleAdd}>
          Agregar noticia
        </button>
      )}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">{editId ? 'Editar noticia' : 'Agregar noticia'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Título</label>
                <input type="text" className="form-control" name="title" value={form.title} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Contenido</label>
                <textarea className="form-control" name="body" value={form.body} onChange={handleChange} required rows={3} />
              </div>
              <div className="mb-3">
                <label className="form-label">Imagen (URL opcional)</label>
                <input type="text" className="form-control" name="image" value={form.image} onChange={handleChange} />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">{editId ? 'Guardar cambios' : 'Agregar'}</button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {news.map(article => (
          <div className="col" key={article.id}>
            <div className="card h-100">
              {article.image && (
                <img src={article.image} alt={article.title} className="card-img-top" style={{ objectFit: 'cover', maxHeight: 200 }} />
              )}
              <div className="card-body">
                <h5 className="card-title">{article.title}</h5>
                <p className="card-text">{article.body}</p>
              </div>
              {user?.role === 'admin' && (
                <div className="card-footer d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(article)}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteNews(article.id)}>Eliminar</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News; 