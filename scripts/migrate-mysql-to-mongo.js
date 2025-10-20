// Para usar este archivo se agrega la sig instruccion en scripts de package.json:
//"migrate:mysql-to-mongo": "node scripts/migrate-mysql-to-mongo.js"

// scripts/migrate-mysql-to-mongo.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_PORT = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;
const MYSQL_TABLE = process.env.MYSQL_TABLE || 'imc';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_PUBLIC_URL;
const MONGO_DB = process.env.MONGO_DB || null; // opcional, si está en URI se usa la DB del URI
const MONGO_COLLECTION = process.env.MONGO_COLLECTION || 'imc';

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '500', 10);
const DROP_BEFORE = (process.env.MIGRATION_DROP_COLLECTION || 'false').toLowerCase() === 'true';

if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DATABASE) {
  console.error('Faltan variables de MySQL. Revisa MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE.');
  process.exit(1);
}
if (!MONGO_URI) {
  console.error('Falta MONGO_URI (o MONGO_PUBLIC_URL).');
  process.exit(1);
}

function normalizeRowToDoc(row) {
  // Copia superficial
  const r = { ...row };

  // Guardamos id original si existe
  if (r.id !== undefined && r.id !== null) {
    r.id_mysql = r.id;
    delete r.id; // opcional: quitamos id original para evitar colisión con _id
  }

  // Normalizar nombres comunes:
  const peso = r.peso ?? r.weight ?? r.peso_kg ?? r.kg ?? null;
  const altura = r.altura ?? r.height ?? r.altura_m ?? r.m ?? null;
  let imc = r.imc ?? r.imc_valor ?? r.imcValor ?? null;

  const categoria = r.categoria ?? r.category ?? r.categoria_imc ?? null;

  // Fecha: varios nombres comunes
  let fecha = r.fechaHora ?? r.fecha_hora ?? r.created_at ?? r.createdAt ?? r.fecha ?? null;
  if (fecha) {
    fecha = (fecha instanceof Date) ? fecha : new Date(fecha);
    if (isNaN(fecha.getTime())) fecha = new Date(); // fallback
  } else {
    fecha = new Date();
  }

  // Forzar tipos numéricos si vienen como strings
  const pesoNum = peso !== null ? Number(peso) : undefined;
  const alturaNum = altura !== null ? Number(altura) : undefined;
  if ((imc === undefined || imc === null || imc === '') && pesoNum && alturaNum) {
    imc = pesoNum / (alturaNum * alturaNum);
  } else {
    imc = imc !== null && imc !== undefined ? Number(imc) : undefined;
  }

  const doc = {
    altura: alturaNum,
    peso: pesoNum,
    imc: imc,
    categoria: categoria,
    fechaHora: fecha,
    // preservamos otros campos para trazabilidad
    ...Object.keys(r).reduce((acc, k) => {
      if (!['peso', 'weight', 'peso_kg', 'kg', 'altura', 'height', 'altura_m', 'm', 'imc', 'imc_valor', 'imcValor', 'categoria', 'category', 'fechaHora', 'fecha_hora', 'created_at', 'createdAt', 'fecha', 'id'].includes(k)) {
        acc[k] = r[k];
      }
      return acc;
    }, {}),
  };

  // Si id_mysql existe, añádelo
  if (r.id_mysql !== undefined) doc.id_mysql = r.id_mysql;

  return doc;
}

(async () => {
  console.log('=== INICIANDO MIGRACIÓN MySQL → MongoDB ===');
  let mysqlConn;
  let mongoClient;

  try {
    mysqlConn = await mysql.createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
    });
    console.log('Conectado a MySQL:', MYSQL_HOST, MYSQL_DATABASE);

    // Contamos filas
    const [countRows] = await mysqlConn.execute(`SELECT COUNT(*) AS cnt FROM \`${MYSQL_TABLE}\``);
    const total = countRows[0] ? Number(countRows[0].cnt) : 0;
    console.log(`Total registros en ${MYSQL_TABLE}: ${total}`);

    const mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    const db = MONGO_DB ? mongoClient.db(MONGO_DB) : mongoClient.db(); // si DB en URI, usa esa
    const coll = db.collection(MONGO_COLLECTION);
    console.log('Conectado a Mongo:', MONGO_URI.split('@').pop?.() ?? 'uri');

    if (DROP_BEFORE) {
      console.log('DROP_COLLECTION activado → Borrando colección antes de migrar');
      await coll.drop().catch(() => {});
    }

    if (total === 0) {
      console.log('No hay registros para migrar.');
      process.exit(0);
    }

    for (let offset = 0; offset < total; offset += BATCH_SIZE) {
      const [rows] = await mysqlConn.query(
        `SELECT * FROM \`${MYSQL_TABLE}\` LIMIT ${BATCH_SIZE} OFFSET ${offset}`
      );

      if (!rows || rows.length === 0) break;

      const docs = rows.map(normalizeRowToDoc);

      // Construimos bulk ops: si tenemos id_mysql hacemos upsert por id_mysql, si no insertOne
      const ops = docs.map((d) => {
        if (d.id_mysql !== undefined && d.id_mysql !== null) {
          return {
            updateOne: {
              filter: { id_mysql: d.id_mysql },
              update: { $set: d },
              upsert: true,
            },
          };
        } else {
          return { insertOne: { document: d } };
        }
      });

      const res = await coll.bulkWrite(ops, { ordered: false });
      console.log(`Batch ${offset}-${offset + rows.length} procesado. inserted: ${res.insertedCount || 0}, upserted: ${res.upsertedCount || 0}`);
    }

    console.log('Migración finalizada ✅');
  } catch (err) {
    console.error('Error en migración:', err);
    process.exitCode = 1;
  } finally {
    if (mysqlConn) await mysqlConn.end().catch(() => {});
    if (mongoClient) await mongoClient.close().catch(() => {});
  }
})();
