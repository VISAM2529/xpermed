import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Tenant } from '@/models/TenantUser';

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const radius = searchParams.get('radius') || '10'; // Default 10km

        if (!lat || !lng) {
            return NextResponse.json({ error: 'Latitude and Longitude are required' }, { status: 400 });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const distanceInMeters = parseFloat(radius) * 1000;

        // Find Distributors within radius
        const distributors = await Tenant.find({
            type: 'DISTRIBUTOR',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: distanceInMeters
                }
            }
        }).select('name subdomain email phone address location distributorSettings');

        return NextResponse.json({
            success: true,
            count: distributors.length,
            data: distributors
        });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
