'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type SellerShopListItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  status: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
};

export default function SellerShopsDashboard() {
  const [shops, setShops] = useState<SellerShopListItem[]>([]);
  const [filtered, setFiltered] = useState<SellerShopListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/seller/shops');
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load shops');
        }
        const data: SellerShopListItem[] = await res.json();
        if (active) {
          setShops(data);
          setFiltered(data);
          setLoading(false);
        }
      } catch (e: any) {
        if (active) {
          setError(e.message || 'Error');
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const s = search.trim().toLowerCase();
    if (!s) {
      setFiltered(shops);
    } else {
      setFiltered(
        shops.filter(
          (shop) =>
            shop.name.toLowerCase().includes(s) ||
            shop.slug.toLowerCase().includes(s) ||
            shop.description?.toLowerCase().includes(s)
        )
      );
    }
  }, [search, shops]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CardTitle>My Shops</CardTitle>
        <div className="flex gap-2 w-full md:w-auto">
          <Input
            placeholder="Search name, slug or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-56"
          />
          <Button
            variant="default"
            onClick={() => router.push('/seller/shops/create')}
          >
            Create Shop
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                {/*<TableHead>Description</TableHead>*/}
                <TableHead>Contact Email</TableHead>
                <TableHead>Contact Phone</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10}>Loading...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10}>
                    {search
                      ? 'No matching shops found.'
                      : 'No shops found. Create your first shop!'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell>
                      {shop.logoUrl ? (
                        <Image
                          src={shop.logoUrl}
                          alt={shop.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-xs">
                          No Logo
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {shop.slug}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          shop.status === 'ACTIVE' ? 'default' : 'secondary'
                        }
                      >
                        {shop.status}
                      </Badge>
                    </TableCell>
                    {/*<TableCell className="max-w-xs truncate">*/}
                    {/*  {shop.description || '—'}*/}
                    {/*</TableCell>*/}
                    <TableCell>{shop.contactEmail || '—'}</TableCell>
                    <TableCell>{shop.contactPhone || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {(shop.ratingAvg ?? 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({shop.ratingCount ?? 0})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(shop.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(`/seller/shops/${shop.id}/edit`)
                          }
                        >
                          Edit
                        </Button>
                        {/*<Button*/}
                        {/*  size="sm"*/}
                        {/*  variant="ghost"*/}
                        {/*  onClick={() => router.push(`/shops/${shop.slug}`)}*/}
                        {/*>*/}
                        {/*  View*/}
                        {/*</Button>*/}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
