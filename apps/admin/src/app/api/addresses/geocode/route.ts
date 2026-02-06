import prisma from '@/lib/prisma';
import { geocodeAddress } from '@/lib/googleMaps';
import { NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (request.method !== 'POST') {
    return NextResponse.json(
      { success: false, message: 'Method not allowed' },
      { status: 405 },
    );
  }

  const apiKey = request.headers.get('authorization');
  if (!apiKey || apiKey !== `Bearer ${process.env.API_SECRET_KEY}`) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const { addressId, zipCode } = await request.json();
    if (!addressId && !zipCode) {
      return NextResponse.json(
        { success: false, message: 'Address ID or zip code is required' },
        { status: 400 },
      );
    }

    let address;

    if (addressId) {
      address = await prisma.address.findUnique({
        where: { id: addressId },
        select: {
          streetName: true,
          number: true,
          city: true,
          state: true,
          zipCode: true,
        },
      });

      if (!address) {
        return NextResponse.json(
          { success: false, message: 'Address not found' },
          { status: 404 },
        );
      }
    } else if (zipCode) {
      try {
        const cleanedZip = zipCode.replace(/[^0-9]/g, '');
        const url = `https://api.pagar.me/1/zipcodes/${cleanedZip}`;

        const { data } = await axios.get(url);

        address = {
          zipCode: data.zipcode,
          street: data.street,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
        };
      } catch {
        return NextResponse.json(
          { success: false, message: 'Address not found' },
          { status: 404 },
        );
      }
    }

    if (!address) {
      return NextResponse.json(
        { success: false, message: 'Address not found' },
        { status: 404 },
      );
    }

    const coords = await geocodeAddress(
      `${address.streetName ?? ''} ${address.number ?? ''}, ${address.city}, ${address.state}, ${address.zipCode}`,
    );

    if (!coords) {
      return NextResponse.json(
        { success: false, message: 'Failed to geocode address' },
        { status: 500 },
      );
    }

    if (addressId) {
      await prisma.address.update({
        where: { id: addressId },
        data: { latitude: coords.latitude, longitude: coords.longitude },
      });
    }

    return NextResponse.json({ success: true, data: coords });
  } catch (error) {
    console.error('Error updating address coordinates:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}
