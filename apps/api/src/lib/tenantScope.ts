import { prisma } from "./prisma";

/**
 * Every tenant-scoped query MUST go through one of these functions.
 * tenantId is always the first parameter and always lands in the Prisma
 * `where` clause, so a query can't accidentally return another tenant's
 * rows even if a caller passes an ID that belongs to a different tenant.
 */

export interface ProductInput {
  name: string;
  price: number;
  stock: number;
  sku: string;
}

export function listProducts(tenantId: string) {
  return prisma.product.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export function findProduct(tenantId: string, productId: string) {
  return prisma.product.findFirst({
    where: { id: productId, tenantId },
  });
}

export function createProduct(tenantId: string, data: ProductInput) {
  return prisma.product.create({
    data: { ...data, tenantId },
  });
}

export async function updateProduct(tenantId: string, productId: string, data: Partial<ProductInput>) {
  const { count } = await prisma.product.updateMany({
    where: { id: productId, tenantId },
    data,
  });
  return count > 0;
}

export async function deleteProduct(tenantId: string, productId: string) {
  const { count } = await prisma.product.deleteMany({
    where: { id: productId, tenantId },
  });
  return count > 0;
}
