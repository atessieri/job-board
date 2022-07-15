export async function createUsers(prisma, data) {
  return await prisma.user.createMany({
    data,
    skipDuplicates: true,
  });
}

export async function createUser(prisma, name, username, email, role, image) {
  return await prisma.user.create({
    data: {
      name,
      username,
      email,
      role,
      image,
    },
  });
}

export async function getUser(prisma, userId) {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}

export async function getUsersRole(prisma, role, take, cursor) {
  const query = {
    where: {
      role,
    },
    take: isNaN(take) ? 10 : take,
  };
  if (!isNaN(cursor)) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }
  const result = await prisma.user.findMany(query);
  return result;
}

export async function updateUser(prisma, userId, name, username, role, image) {
  const data = {};
  if (name) {
    data.name = name;
  }
  if (username) {
    data.username = username;
  }
  if (role) {
    data.role = role;
  }
  if (image) {
    data.image = image;
  }
  return await prisma.user.updateMany({
    data,
    where: {
      id: userId,
    },
  });
}

export async function getJobs(prisma, onlyPublished = true, jobAuthorId, take, cursor) {
  const query = {
    orderBy: [
      {
        id: 'desc',
      },
    ],
    include: {
      author: true,
      _count: {
        select: { application: true },
      },
    },
    take: isNaN(take) ? 10 : take,
  };
  if (onlyPublished && jobAuthorId) {
    query.where = {
      AND: [
        {
          authorId: jobAuthorId,
        },
        {
          published: onlyPublished,
        },
      ],
    };
  } else if (onlyPublished) {
    query.where = {
      published: onlyPublished,
    };
  } else if (jobAuthorId) {
    query.where = {
      authorId: jobAuthorId,
    };
  }
  if (!isNaN(cursor)) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }
  return await prisma.job.findMany(query);
}

export async function createJob(prisma, jobAuthorId, title, description, salary, location, published) {
  return await prisma.job.create({
    data: {
      title,
      description,
      salary,
      location,
      published,
      author: {
        connect: { id: jobAuthorId },
      },
    },
  });
}

export async function getJob(prisma, jobId) {
  return await prisma.job.findUnique({
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
}

export async function getJobWithApplication(prisma, jobId, applicationAuthorId) {
  return await prisma.application.findMany({
    where: {
      AND: [{ jobId }, { authorId: applicationAuthorId }],
    },
    include: {
      job: true,
    },
    orderBy: {
      id: 'desc',
    },
  });
}

export async function updateJob(prisma, jobAuthorId, jobId, title, description, salary, location, published) {
  const data = {};
  if (title) {
    data.title = title;
  }
  if (description) {
    data.description = description;
  }
  if (salary) {
    data.salary = salary;
  }
  if (location) {
    data.location = location;
  }
  if (published) {
    data.published = published;
  }
  return await prisma.job.updateMany({
    data,
    where: {
      AND: [{ id: jobId }, { authorId: jobAuthorId }],
    },
  });
}

export async function deleteJob(prisma, jobAuthorId, jobId) {
  return await prisma.job.deleteMany({
    where: {
      AND: [{ id: jobId }, { authorId: jobAuthorId }],
    },
  });
}

export async function getJobApplications(prisma, jobId, take, cursor) {
  const query = {
    where: {
      id: jobId,
    },
    include: {
      author: true,
      application: {
        orderBy: [
          {
            id: 'desc',
          },
        ],
        take: isNaN(take) ? 10 : take,
      },
    },
  };
  if (!isNaN(cursor)) {
    query.include.application.cursor = { id: cursor };
    query.include.application.skip = 1;
  }
  return await prisma.job.findUnique(query);
}

export async function getUserAppliedJobs(prisma, applicationAuthorId, take, cursor) {
  const query = {
    where: {
      authorId: applicationAuthorId,
    },
    orderBy: [
      {
        id: 'desc',
      },
    ],
    include: {
      job: true,
    },
    take: isNaN(take) ? 10 : take,
  };
  if (!isNaN(cursor)) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }
  return await prisma.application.findMany(query);
}

export async function createApplication(prisma, applicationAuthorId, jobId, coverLetter) {
  return await prisma.application.create({
    data: {
      coverLetter,
      author: {
        connect: { id: applicationAuthorId },
      },
      job: {
        connect: { id: jobId },
      },
    },
  });
}

export async function getApplication(prisma, applicationAuthorId, applicationId) {
  return await prisma.application.findMany({
    where: {
      AND: [{ id: applicationId }, { authorId: applicationAuthorId }],
    },
    include: {
      author: true,
      job: true,
    },
  });
}

export async function updateApplication(prisma, userId, applicationId, coverLetter) {
  return await prisma.application.updateMany({
    data: { coverLetter },
    where: {
      AND: [{ id: applicationId }, { authorId: userId }],
    },
  });
}

export async function deleteApplication(prisma, applicationAuthorId, applicationId) {
  return await prisma.application.deleteMany({
    where: {
      AND: [{ id: applicationId }, { authorId: applicationAuthorId }],
    },
  });
}

export async function cleanDatabase(prisma, userId) {
  return await prisma.user.deleteMany({
    where: {
      NOT: {
        id: userId,
      },
    },
  });
}
