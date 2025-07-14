const Database = require('better-sqlite3');

const src = new Database('data_backup.sqlite');
const dest = new Database('data.sqlite');

function copiarTabla(tabla, columnas) {
  const rows = src.prepare(`SELECT ${columnas.join(', ')} FROM ${tabla}`).all();
  if (rows.length === 0) return;
  const placeholders = columnas.map(() => '?').join(', ');
  const insert = dest.prepare(`INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES (${placeholders})`);
  const insertMany = dest.transaction((rows) => {
    for (const row of rows) {
      insert.run(...columnas.map(col => row[col]));
    }
  });
  insertMany(rows);
  console.log(`Migrados ${rows.length} registros de ${tabla}`);
}

// Tablas y columnas a migrar (omitimos calificacion y venta)
const tablas = [
  { nombre: 'categoria', columnas: ['id', 'nombre'] },
  { nombre: 'plataforma', columnas: ['id', 'nombre'] },
  { nombre: 'juego', columnas: ['id', 'nombre', 'precio', 'categoria_id', 'esta_oferta', 'estado', 'image', 'trailer', 'precio_oferta'] },
  { nombre: 'juego_plataforma', columnas: ['juego_id', 'plataforma_id'] },
  { nombre: 'noticia', columnas: ['id', 'titulo', 'texto', 'activo'] },
];

for (const t of tablas) {
  copiarTabla(t.nombre, t.columnas);
}

src.close();
dest.close();
console.log('¡Migración de datos completada!'); 