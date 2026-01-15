import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Product } from '@/models/Inventory';
import { getSubdomain } from '@/lib/tenant/context';
import { Tenant } from '@/models/TenantUser';

import Link from 'next/link'; import mongoose from 'mongoose';

// GET: List Products for Tenant
export async function GET(req: NextRequest) {
    await dbConnect();
    const tenantIdHeader = req.headers.get('x-tenant-id');

    let tenantId;

    if (tenantIdHeader && mongoose.Types.ObjectId.isValid(tenantIdHeader)) {
        tenantId = new mongoose.Types.ObjectId(tenantIdHeader);
    } else if (tenantIdHeader) {
        const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });
        if (tenant) tenantId = tenant._id;
    }

    if (!tenantId) {
        // STRICT SECURITY: Do NOT return all products if tenant is unknown
        return NextResponse.json({ products: [] });
    }

    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        let matchStage: any = { tenantId };

        if (search) {
            matchStage.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'batches',
                    let: { pid: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$productId', '$$pid'] },
                                        { $gt: ['$quantity', 0] },
                                        // Optional: Check expiry
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'batches'
                }
            },
            {
                $addFields: {
                    totalStock: { $sum: '$batches.quantity' },
                    currentMrp: { $max: '$batches.mrp' } // Get max MRP or use $first from sorted batches
                }
            },
            { $sort: { name: 1 } },
            { $limit: 50 },
            { $project: { batches: 0 } } // Remove heavy batch array
        ]);

        return NextResponse.json({ products });
    } catch (error) {
        console.error("Product Fetch Error:", error);
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}

// POST: Create New Product
export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const body = await req.json();
        const tenantIdHeader = req.headers.get('x-tenant-id');
        let tenantId;

        if (tenantIdHeader && mongoose.Types.ObjectId.isValid(tenantIdHeader)) {
            tenantId = tenantIdHeader;
        } else {
            const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });
            if (tenant) tenantId = tenant._id;
        }

        if (!tenantId) return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });

        const product = await Product.create({
            ...body,
            tenantId,
        });

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Create failed' }, { status: 500 });
    }
}
