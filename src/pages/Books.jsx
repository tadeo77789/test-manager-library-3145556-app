import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth.jsx';
import { ErrorBox, Notice, Pager } from '../components/ui.jsx';

function Cover({ book, version }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let alive = true;
    let created = null;
    if (book.cover_key) {
      api.coverBlobUrl(book.id).then((u) => { created = u; if (alive) setUrl(u); });
    } else setUrl(null);
    return () => { alive = false; if (created) URL.revokeObjectURL(created); };
  }, [book.id, book.cover_key, version]);
  return url ? <img className="cover" src={url} alt={`Portada de ${book.title}`} /> : <div className="cover" aria-hidden="true" />;
}

const EMPTY = { title: '', author: '', isbn: '', category_id: '', total_copies: 1 };

export default function Books() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState('');
  const [form, setForm] = useState(null); // null = hidden, {id?, ...fields}
  const [formError, setFormError] = useState(null);
  const [version, setVersion] = useState(0);
  const fileRef = useRef(null);

  const requestId = useRef(0);
  const load = useCallback(async () => {
    const id = ++requestId.current;
    setError(null);
    try {
      const result = await api.books({ q, category_id: category, page, size: 10 });
      if (id === requestId.current) setData(result); // ignore responses of superseded queries
    } catch (e) { if (id === requestId.current) setError(e); }
  }, [q, category, page]);

  useEffect(() => { api.categories().then((c) => setCategories(c.items || c)).catch(setError); }, []);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function save(e) {
    e.preventDefault();
    setFormError(null);
    const body = { title: form.title, author: form.author, category_id: form.category_id, total_copies: Number(form.total_copies) };
    try {
      if (form.id) await api.updateBook(form.id, body);
      else await api.createBook({ ...body, isbn: form.isbn });
      setOk(form.id ? 'Libro actualizado.' : 'Libro creado.');
      setForm(null);
      load();
    } catch (err) { setFormError(err); }
  }

  async function remove(b) {
    if (!window.confirm(`¿Dar de baja «${b.title}»?`)) return;
    setOk(''); setError(null);
    try { await api.deleteBook(b.id); setOk('Libro dado de baja.'); load(); } catch (e) { setError(e); }
  }

  async function upload(b, file) {
    if (!file) return;
    setOk(''); setError(null);
    try { await api.uploadCover(b.id, file); setOk('Portada actualizada.'); setVersion((v) => v + 1); load(); } catch (e) { setError(e); }
  }

  async function removeCover(b) {
    setOk(''); setError(null);
    try { await api.deleteCover(b.id); setOk('Portada eliminada.'); load(); } catch (e) { setError(e); }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h1>Catálogo</h1>
      <div className="row">
        <label>Buscar<input value={q} placeholder="Título, autor o ISBN" onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
        <label>Categoría
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">Todas</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        {isAdmin && <button className="btn primary" onClick={() => { setForm({ ...EMPTY, category_id: categories[0]?.id || '' }); setFormError(null); }}>Nuevo libro</button>}
      </div>
      <ErrorBox error={error} /><Notice>{ok}</Notice>

      {form && (
        <form className="card" onSubmit={save}>
          <h2>{form.id ? 'Editar libro' : 'Nuevo libro'}</h2>
          <div className="row">
            <label>Título<input value={form.title} onChange={set('title')} required /></label>
            <label>Autor<input value={form.author} onChange={set('author')} required /></label>
            {!form.id && <label>ISBN<input value={form.isbn} onChange={set('isbn')} required /></label>}
            <label>Categoría
              <select value={form.category_id} onChange={set('category_id')} required>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Ejemplares<input type="number" min="1" value={form.total_copies} onChange={set('total_copies')} required /></label>
          </div>
          <ErrorBox error={formError} />
          <button className="btn primary">Guardar</button>{' '}
          <button type="button" className="btn" onClick={() => setForm(null)}>Cancelar</button>
        </form>
      )}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th></th><th>Título</th><th>Autor</th><th>ISBN</th><th>Categoría</th><th>Disponibles</th>{isAdmin && <th>Acciones</th>}</tr>
          </thead>
          <tbody>
            {data?.items.map((b) => (
              <tr key={b.id}>
                <td><Cover book={b} version={version} /></td>
                <td>{b.title}</td><td>{b.author}</td><td>{b.isbn}</td><td>{b.category?.name}</td>
                <td>{b.available_copies} / {b.total_copies}</td>
                {isAdmin && (
                  <td>
                    <button className="btn small" onClick={() => { setForm({ id: b.id, title: b.title, author: b.author, isbn: b.isbn, category_id: b.category.id, total_copies: b.total_copies }); setFormError(null); window.scrollTo(0, 0); }}>Editar</button>{' '}
                    <label className="btn small" style={{ display: 'inline-block', color: 'inherit', cursor: 'pointer' }}>
                      Portada
                      <input type="file" accept="image/png,image/jpeg" hidden ref={fileRef} onChange={(e) => { upload(b, e.target.files[0]); e.target.value = ''; }} />
                    </label>{' '}
                    {b.cover_key && <><button className="btn small" onClick={() => removeCover(b)}>Quitar portada</button>{' '}</>}
                    <button className="btn small danger" onClick={() => remove(b)}>Dar de baja</button>
                  </td>
                )}
              </tr>
            ))}
            {data && data.items.length === 0 && <tr><td colSpan="7" className="muted">Sin resultados.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager data={data} onPage={setPage} />
    </>
  );
}
