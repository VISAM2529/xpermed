
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Product, Batch } from '@/models/Inventory';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: Request) {
    try {
        await dbConnect();

        // Auth Logic
        const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        let tenantId = request.headers.get('x-tenant-id');

        if (!tenantId && token) {
            const decoded = verifyToken(token);
            if (decoded) tenantId = decoded.tenantId;
        }

        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch Products with their total stock
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        const query: any = { tenantId };
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });

        // Get stock for each product
        const productsWithStock = await Promise.all(products.map(async (p) => {
            const batches = await Batch.find({ productId: p._id });
            const totalStock = batches.reduce((acc, b) => acc + b.quantity, 0);
            // Calculate Max MRP from batches
            const maxMrp = batches.reduce((max, b) => b.mrp > max ? b.mrp : max, 0);

            return {
                ...p.toObject(),
                stock: totalStock,
                batchCount: batches.length,
                mrp: maxMrp // Add MRP field for frontend display
            };
        }));

        return NextResponse.json({ products: productsWithStock });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { initialStock, mrp, purchaseRate, expiryDate, ...productFields } = body;

    // Clean product fields (remove SKU if empty/null/undefined to avoid unique index issues)
    if (!productFields.sku) delete productFields.sku;

    // Declare tenantId outside to be used in catch block
    let tenantIdStr: string | undefined;

    try {
        await dbConnect();

        // Auth Logic
        const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        let tenantId = request.headers.get('x-tenant-id');

        if (!tenantId && token) {
            const decoded = verifyToken(token);
            if (decoded) tenantId = decoded.tenantId;
        }

        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        tenantIdStr = tenantId;

        // Create Product
        const product = await Product.create({
            ...productFields,
            tenantId
        });

        // Optionally create an initial batch if stock provided
        if (initialStock && Number(initialStock) > 0) {
            try {
                await Batch.create({
                    tenantId,
                    productId: product._id,
                    batchNumber: `INIT-${Date.now()}`,
                    expiryDate: expiryDate ? new Date(expiryDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    quantity: Number(initialStock),
                    mrp: Number(mrp) || 0,
                    purchaseRate: Number(purchaseRate) || 0
                });
            } catch (batchError) {
                console.error("Failed to create initial batch:", batchError);
            }
        }

        return NextResponse.json({ product }, { status: 201 });

    } catch (error: any) {
        console.error("Product Create Error:", error);

        // SELF-HEALING: Handle Stuck Index for Duplicate SKU (Null/Missing)
        if (error.code === 11000 && error.message.includes('sku_1') && tenantIdStr) {
            console.warn("Detected stuck SKU index. Attempting to auto-fix...");
            try {
                // Drop the old index
                await Product.collection.dropIndex('tenantId_1_sku_1');
                console.log("Successfully dropped old SKU index. Retrying creation...");

                // Retry creation once
                const product = await Product.create({
                    ...productFields,
                    tenantId: tenantIdStr
                });

                // Retry initial batch if needed
                if (initialStock && Number(initialStock) > 0) {
                    await Batch.create({
                        tenantId: tenantIdStr,
                        productId: product._id,
                        batchNumber: `INIT-${Date.now()}`,
                        expiryDate: expiryDate ? new Date(expiryDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                        quantity: Number(initialStock),
                        mrp: Number(mrp) || 0,
                        purchaseRate: Number(purchaseRate) || 0
                    });
                }

                return NextResponse.json({ product, message: "Fixed index and created product." }, { status: 201 });

            } catch (retryError: any) {
                console.error("Retry failed:", retryError);
                return NextResponse.json({ error: "Failed to auto-fix index. Please contact support." }, { status: 500 });
            }
        }

        // Handle other Duplicate Key Errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json({ error: `Duplicate value for ${field}. Please use a unique value.` }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
