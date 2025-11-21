'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SellerProductListItem } from '@/types/product.data-types';

export default function SellerProductsDashboard() {
  const [products, setProducts] = useState<SellerProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/seller/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Listing</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : !products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7h18M3 12h18M3 17h18"
              />
            </svg>
            <h3 className="text-lg font-medium">No products yet</h3>
            <p className="text-sm text-muted-foreground">
              You haven&apos;t created any products. Create your first product
              to get started.
            </p>
            <Button onClick={() => router.push('/seller/products/create')}>
              Create product
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.images?.[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.title}
                        width={48}
                        height={48}
                        className="rounded"
                      />
                    ) : (
                      <span>No image</span>
                    )}
                  </TableCell>
                  <TableCell>{product.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.visibility}</Badge>
                  </TableCell>
                  <TableCell>
                    {product.minPrice} - {product.maxPrice} {product.currency}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.shop.logoUrl && (
                        <Image
                          src={product.shop.logoUrl}
                          alt={product.shop.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <span>{product.shop.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/seller/products/${product.id}/edit`)
                      }
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
