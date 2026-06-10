import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { toEmail, toName, subject, message } = await request.json();

    if (!toEmail || !toName || !message) {
      return NextResponse.json({ error: 'Recipient email, recipient name, and message are required' }, { status: 400 });
    }

    const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_wge5511';
    const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_nyghwst';
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'IaShGbdy933hCssNL';
    const privateKey = process.env.EMAILJS_PRIVATE_KEY || 'nRHfwL_WhtfexoLXMxdf9';

    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        to_name: toName,
        to_email: toEmail,
        subject: subject || 'Whaatachi Notification',
        message: message,
      },
    };

    const emailJsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!emailJsResponse.ok) {
      const errorText = await emailJsResponse.text();
      console.error('EmailJS request failed:', errorText);
      return NextResponse.json({ error: `EmailJS error: ${errorText}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully via EmailJS' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
