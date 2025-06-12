require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
app.use(express.json());
const supabaseUrl = 'https://dnzqeoccqpqheljqayuf.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAuthUser({ email, password }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error('Error de Supabase:', error.message);
    throw new Error(`Error al crear el usuario: ${error.message}`);
  }
  return data.user;
}

/**
 * Función para iniciar sesión con correo y contraseña.
 * @param {string} email - El correo electrónico del usuario.
 * @param {string} password - La contraseña del usuario.
 * @returns {Promise<object>} El objeto de sesión del usuario.
 * @throws {Error} Si ocurre un error al iniciar sesión.
 */
async function signInUser({ email, password }) {
  // Utiliza el método signInWithPassword para autenticar al usuario
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Error al iniciar sesión: ${error.message}`);
  }
  return data.session;
}

app.post('/create-auth-user', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        data: null,
        error: 'Faltan el correo electrónico o la contraseña.',
      });
    }

    const user = await createAuthUser({ email, password });
    res.status(201).json({ data: user, error: null });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario', data: null });
  }
});

app.post('/sign-in-user', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Faltan el correo electrónico o la contraseña.' });
    }

    const session = await signInUser({ email, password });
    res.status(200).json({ message: 'Sesión iniciada exitosamente', session });
  } catch (error) {
    res
      .status(401)
      .json({ error: 'Fallo al iniciar sesión', details: error.message });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log('a');
});
