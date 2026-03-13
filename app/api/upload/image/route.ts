import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { verifyJWT } from '@/lib/auth';

const DEVELOPER_EMAIL = process.env.NEXT_PUBLIC_DEVELOPER_EMAIL || 'ganeshsharna7114@gmail.com';

export async function POST(request: Request) {
  try {
    const user = await verifyJWT();
    if (!user || user.email !== DEVELOPER_EMAIL) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: 'nightmare/products/images',
      resource_type: 'auto'
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
