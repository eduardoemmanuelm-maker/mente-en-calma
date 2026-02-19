// api/crear-pago.js
// Esta función corre en Vercel y se comunica con Mercado Pago de forma segura.

export default async function handler(req, res) {
  // Solo aceptar peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { nombre, email, servicio, modalidad, motivo, edad } = req.body;

  // Precios según el servicio seleccionado
  const precios = {
    primera:    { titulo: 'Primera Consulta',   precio: 350  },
    individual: { titulo: 'Consulta Individual', precio: 500  },
    paquete:    { titulo: 'Paquete Mensual',     precio: 1600 },
  };

  const seleccion = precios[servicio];
  if (!seleccion) {
    return res.status(400).json({ error: 'Servicio inválido' });
  }

  try {
    // Llamada a la API de Mercado Pago para crear una preferencia de pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Tu Access Token de Mercado Pago va en las variables de entorno de Vercel (nunca aquí directo)
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: `${seleccion.titulo} · ${modalidad === 'online' ? 'En línea' : 'Presencial'}`,
            quantity: 1,
            unit_price: seleccion.precio,
            currency_id: 'MXN',
          },
        ],
        payer: {
          name: nombre,
          email: email,
        },
        // Información adicional para identificar la consulta
        metadata: {
          nombre,
          edad,
          email,
          modalidad,
          motivo,
        },
        // URLs a donde MP redirige al usuario después del pago
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/gracias.html`,
          failure: `${process.env.NEXT_PUBLIC_URL}/error.html`,
          pending: `${process.env.NEXT_PUBLIC_URL}/pendiente.html`,
        },
        auto_return: 'approved',
        // Notificación automática cuando el pago se completa (webhook)
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhook-pago`,
        statement_descriptor: 'MENTE EN CALMA',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de Mercado Pago:', data);
      return res.status(500).json({ error: 'Error al crear el pago' });
    }

    // Devolver el link de pago al frontend
    return res.status(200).json({
      url_pago: data.init_point, // URL real de pago
      id: data.id,
    });

  } catch (error) {
    console.error('Error del servidor:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
