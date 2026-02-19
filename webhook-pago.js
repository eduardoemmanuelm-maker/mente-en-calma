// api/webhook-pago.js
// Mercado Pago llama a esta función automáticamente cuando un pago se completa.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { type, data } = req.body;

  // Solo nos interesan las notificaciones de pagos
  if (type === 'payment') {
    const pagoId = data.id;

    try {
      // Consultar los detalles del pago a Mercado Pago
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${pagoId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      });

      const pago = await response.json();

      if (pago.status === 'approved') {
        const { nombre, email, modalidad, motivo } = pago.metadata;

        console.log(`✅ Pago aprobado para: ${nombre} (${email})`);
        console.log(`   Modalidad: ${modalidad}`);
        console.log(`   Motivo: ${motivo}`);

        // AQUÍ puedes agregar en el futuro:
        // - Envío de correo de confirmación (con Resend o Nodemailer)
        // - Creación de evento en Google Calendar
        // - Guardar en base de datos
      }

    } catch (error) {
      console.error('Error procesando webhook:', error);
    }
  }

  // Siempre responder 200 para que MP no reintente
  return res.status(200).end();
}
