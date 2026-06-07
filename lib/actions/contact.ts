'use server';
import { z } from 'zod';
import { Resend } from 'resend';

const schema = z.object({
  name: z.string().min(2),
  company: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10),
  honeypot: z.string().optional(),
});

export type ContactState =
  | { ok: true }
  | { ok: false; errors: Partial<Record<'name' | 'email' | 'message' | 'form', string>> };

export async function submitContactForm(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      errors: {
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        message: fieldErrors.message?.[0],
      },
    };
  }
  if (parsed.data.honeypot && parsed.data.honeypot.length > 0) {
    return { ok: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    return { ok: false, errors: { form: 'Email service not configured.' } };
  }
  const resend = new Resend(apiKey);
  const { name, company, email, phone, service, message } = parsed.data;
  const subject = `New consultation request from ${name}${company ? ` (${company})` : ''}`;
  const html = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Company:</strong> ${escapeHtml(company ?? '')}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone ?? '')}</p>
    <p><strong>Service:</strong> ${escapeHtml(service ?? '')}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
  `;
  const { error } = await resend.emails.send({ from, to, subject, html, replyTo: email });
  if (error) return { ok: false, errors: { form: 'Failed to send. Please try again.' } };
  return { ok: true };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]!));
}
