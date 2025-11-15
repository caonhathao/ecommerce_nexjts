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
      });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Listing</CardTitle>
      </CardHeader>
      <CardContent>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>Loading...</TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>No products found.</TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
