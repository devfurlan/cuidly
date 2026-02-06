import { getBasicData } from '@/lib/bigdatacorp';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const document = searchParams.get('document');

  if (!document) {
    return NextResponse.json(
      { error: 'Document parameter is required' },
      { status: 400 },
    );
  }

  if (!/^\d{11}$/.test(document)) {
    return NextResponse.json(
      { error: 'Invalid document format' },
      { status: 400 },
    );
  }

  try {
    const apiResponse = await getBasicData(document);

    if (apiResponse.Status.basic_data[0].Message !== 'OK') {
      throw new Error(`API Error: ${apiResponse.Status}`);
    }

    const data = apiResponse;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 },
    );
  }
}
