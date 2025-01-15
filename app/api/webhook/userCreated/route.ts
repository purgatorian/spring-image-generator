import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { id, email_addresses } = body.data;

    const email = email_addresses[0]?.email_address;

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing user ID or email' }, { status: 400 });
    }

    // ✅ Create a user in the database
    await prisma.user.create({
      data: {
        id,
        email,
      },
    });

    return NextResponse.json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
