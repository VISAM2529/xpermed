
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Product } from '@/models/Inventory';

export async function GET() {
    try {
        await dbConnect();

        const collection = Product.collection;

        // List indexes to verify
        const indexes = await collection.indexes();
        const indexNames = indexes.map((i: any) => i.name);

        let message = 'No index needed fixing.';

        if (indexNames.includes('tenantId_1_sku_1')) {
            await collection.dropIndex('tenantId_1_sku_1');
            message = 'Dropped old tenantId_1_sku_1 index. Mongoose will recreate it correctly on next app validation.';
        }

        return NextResponse.json({
            success: true,
            message,
            existingIndexes: indexNames
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
