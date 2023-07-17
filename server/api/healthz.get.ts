const startupTime = new Date()

const handler = defineEventHandler(async (event) => {
  try {
    await event.context.prisma.$queryRaw`SELECT 1;`
  }
  catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'DB failed initialization check' })
  }

  return {
    ok: true,
    status: 'healthy',
    time: new Date(),
    startupTime,
  }
})

export type HealthCheckData = Awaited<ReturnType<typeof handler>>
export default handler
