import { Prisma, PrismaClient } from '@prisma/client';

export type Job = {
  id: number;
  createdAt: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  published: boolean;
  authorId: string;
};

export type JobAppCount = {
  job: Job;
  appCount: number;
};

export type JobAuthorAppCount = {
  job: Job;
  author: {
    name: string | null;
    email: string;
    username: string | null;
    imagePath: string | null;
  };
  appCount: number;
};

export default class JobManage {
  static async getJobs(
    prisma: PrismaClient,
    onlyPublished: boolean = true,
    jobAuthorId?: string,
    take?: number,
    cursor?: number,
  ) {
    const queryResult = await prisma.job.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true,
            username: true,
            imagePath: true,
          },
        },
        _count: {
          select: { application: true },
        },
      },
      where: {
        AND: [
          {
            authorId: jobAuthorId,
          },
          {
            published: onlyPublished,
          },
        ],
      },
      orderBy: [
        {
          id: 'desc',
        },
      ],
      take: typeof take !== 'undefined' && !isNaN(take) ? take : 10,
      cursor: typeof cursor !== 'undefined' && !isNaN(cursor) ? { id: cursor } : undefined,
      skip: typeof cursor !== 'undefined' && !isNaN(cursor) ? 1 : undefined,
    });
    return queryResult.map((job) => {
      return {
        job: {
          id: job.id,
          createdAt: job.createdAt.toISOString(),
          title: job.title,
          description: job.description,
          salary: job.salary.toString(),
          location: job.location,
          published: job.published,
          authorId: job.authorId,
        },
        author: {
          name: job.author.name,
          email: job.author.email,
          username: job.author.username,
          imagePath: job.author.imagePath,
        },
        appCount: job._count.application,
      };
    }) as JobAuthorAppCount[];
  }

  async createJob(
    prisma: PrismaClient,
    jobAuthorId: string,
    title: string,
    description: string,
    salary: string,
    location: string,
    published: boolean,
  ) {
    const queryResult = await prisma.job.create({
      data: {
        title,
        description,
        salary: new Prisma.Decimal(salary),
        location,
        published,
        author: {
          connect: { id: jobAuthorId },
        },
      },
    });
    return {
      id: queryResult.id,
      createdAt: queryResult.createdAt.toISOString(),
      title: queryResult.title,
      description: queryResult.description,
      salary: queryResult.salary.toString(),
      location: queryResult.location,
      published: queryResult.published,
      authorId: queryResult.authorId,
    } as Job;
  }

  async getJob(prisma: PrismaClient, jobId: number) {
    const queryResult = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      include: {
        author: true,
        _count: {
          select: { application: true },
        },
      },
    });
    if (queryResult === null) {
      return undefined;
    }
    return {
      job: {
        id: queryResult.id,
        createdAt: queryResult.createdAt.toISOString(),
        title: queryResult.title,
        description: queryResult.description,
        salary: queryResult.salary.toString(),
        location: queryResult.location,
        published: queryResult.published,
        authorId: queryResult.authorId,
      },
      appCount: queryResult._count.application,
    } as JobAppCount;
  }

  async updateJob(
    prisma: PrismaClient,
    jobId: number,
    title?: string,
    description?: string,
    salary?: string,
    location?: string,
    published?: boolean,
  ) {
    const queryResult = await prisma.job.update({
      data: {
        title,
        description,
        salary: typeof salary !== 'undefined' ? new Prisma.Decimal(salary) : undefined,
        location,
        published,
      },
      where: {
        id: jobId,
      },
    });
    return {
      id: queryResult.id,
      createdAt: queryResult.createdAt.toISOString(),
      title: queryResult.title,
      description: queryResult.description,
      salary: queryResult.salary.toString(),
      location: queryResult.location,
      published: queryResult.published,
      authorId: queryResult.authorId,
    } as Job;
  }

  async deleteJob(prisma: PrismaClient, jobId: number) {
    return await prisma.job.delete({
      where: {
        id: jobId,
      },
    });
  }
}
