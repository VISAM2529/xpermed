import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Purchase, Supplier } from '@/models/Procurement';
import { Batch } from '@/models/Inventory';
import { Tenant } from '@/models/TenantUser';

// GET: List Recent Purchases
export async function GET(req: NextRequest) {
    await dbConnect();

    const tenantIdHeader = req.headers.get('x-tenant-id');
    const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });
    if (!tenant) return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });

    try {
        const purchases = await Purchase.find({ tenantId: tenant._id })
            .populate('supplierId', 'name')
            .sort({ invoiceDate: -1 })
            .limit(50);

        return NextResponse.json({ purchases });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
    }
}

// POST: Create Purchase Entry (Inward Stock)
// POST: Create Purchase Entry (Inward Stock)
export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const body = await req.json();
        const { supplierName, invoiceNumber, invoiceDate, items, totalAmount } = body;

        const tenantIdHeader = req.headers.get('x-tenant-id');
        const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });
        if (!tenant) return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });

        // 0. Find or Create Supplier
        let supplier = await Supplier.findOne({ tenantId: tenant._id, name: supplierName });
        if (!supplier) {
            supplier = await Supplier.create({
                tenantId: tenant._id,
                name: supplierName || 'Cash Supplier',
                openingBalance: 0
            });
        }

        // 1. Create Purchase Record
        const purchase = await Purchase.create({
            tenantId: tenant._id,
            supplierId: supplier._id,
            invoiceNumber,
            invoiceDate: new Date(invoiceDate),
            items: items.map((i: any) => ({
                productId: i.productId,
                batchNumber: i.batchNumber,
                expiryDate: new Date(i.expiryDate), // Ensure Date
                quantity: i.quantity,
                costPrice: i.purchaseRate, // Schema uses costPrice
                mrp: i.mrp,
                taxAmount: 0
            })),
            totalAmount,
            taxAmount: 0,
            status: 'received'
        });

        // 2. Update Inventory (Create Batches)
        for (const item of items) {
            // Check if batch exists (for re-stocking same batch) or create new
            let batch = await Batch.findOne({
                tenantId: tenant._id,
                productId: item.productId,
                batchNumber: item.batchNumber
            });

            if (batch) {
                batch.quantity += item.quantity;
                await batch.save();
            } else {
                await Batch.create({
                    tenantId: tenant._id,
                    productId: item.productId,
                    batchNumber: item.batchNumber,
                    expiryDate: new Date(item.expiryDate),
                    quantity: item.quantity,
                    mrp: item.mrp,
                    purchaseRate: item.purchaseRate,
                    purchaseId: purchase._id
                });
            }
        }

        return NextResponse.json({ success: true, purchase });
    } catch (error: any) {
        console.error("Purchase Creation Error:", error);
        return NextResponse.json({ error: error.message || 'Purchase failed' }, { status: 500 });
    }
}
