import { createClient } from '@supabase/supabase-js';
import { isProjectImage } from '@/lib/cloudinary/project-image';
import type { Database } from '@/lib/supabase/database.types';

const uploadError = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!token || !supabaseUrl || !publishableKey) return uploadError('Administrator authentication is required.', 401);

  const supabase = createClient<Database>(supabaseUrl, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (user?.app_metadata.role !== 'admin') return uploadError('Administrator access is required.', 403);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return uploadError('Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.', 503);

  const file = (await request.formData()).get('file');
  if (!(file instanceof File) || !isProjectImage(file)) return uploadError('Choose a JPG, PNG, or WEBP image up to 5 MB.');

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_PROJECTS_FOLDER || 'project-voting/projects';
  const transformation = 'c_limit,h_810,w_1200/q_auto';
  const signatureSource = `folder=${folder}&timestamp=${timestamp}&transformation=${transformation}${apiSecret}`;
  const signature = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(signatureSource));
  const signatureHex = [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  const body = new FormData();
  body.set('file', file);
  body.set('api_key', apiKey);
  body.set('timestamp', String(timestamp));
  body.set('folder', folder);
  body.set('transformation', transformation);
  body.set('signature', signatureHex);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body });
  const result = await response.json().catch(() => null) as { secure_url?: string } | null;
  if (!response.ok || !result?.secure_url) return uploadError('Cloudinary could not upload this image.', 502);
  return Response.json({ url: result.secure_url });
}
