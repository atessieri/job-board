export type JobJSON = {
    createdAt   DateTime      @default(now())
    title       String
    description String
    salary      Decimal       @db.Decimal(9,2)
    location    String
    published   Boolean      
    author      User          @relation(fields: [authorId], references: [id], onDelete: Cascade)
    authorId    String
  
  id?: string | null;
  createdAt?: string | null;
  title?: string | null;
  description?: string | null;
  imagePath?: string | null;
  role?: Role | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};
