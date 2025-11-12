import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cats = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ position: 'asc' }],
    });

    const map = new Map();
    cats.forEach((c) => map.set(c.id, { ...c, children: [] }));

    const roots: any[] = [];
    cats.forEach((c) => {
      if (c.parentId) {
        const parent = map.get(c.parentId);
        if (parent) parent.children.push(map.get(c.id));
      } else {
        roots.push(map.get(c.id));
      }
    });

    return NextResponse.json(roots);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
