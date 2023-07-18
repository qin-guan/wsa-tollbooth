import { getRandomValues } from 'node:crypto'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { protectedProcedure, router } from '~/server/trpc/trpc'

function getRandomIntInclusive(min: number, max: number) {
  const randomBuffer = new Uint32Array(1)

  getRandomValues(randomBuffer)

  const randomNumber = randomBuffer[0] / (0xFFFFFFFF + 1)

  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(randomNumber * (max - min + 1)) + min
}

export const luckyDrawRouter = router({
  pastWinners: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findMany({
      where: {
        won: true,
      },
    })
  }),
  deleteWinner: protectedProcedure.input(
    z.object({
      id: z.string(),
    }),
  ).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.user.update({
      where: {
        id: input.id,
      },
      data: {
        won: false,
      },
    })
  }),
  draw: protectedProcedure.mutation(async ({ ctx }) => {
    const [byBooths, byWorkshops, previousWinners] = await Promise.all([
      ctx.prisma.response.groupBy({
        by: ['respondentId'],
        where: {
          survey: {
            workshop: false,
          },
        },
        having: {
          surveyId: {
            _count: {
              gt: 1,
            },
          },
        },
      }).then(r => r.map(j => j.respondentId)),
      ctx.prisma.response.groupBy({
        by: ['respondentId'],
        where: {
          survey: {
            workshop: true,
          },
        },
        having: {
          surveyId: {
            _count: {
              gt: 0,
            },
          },
        },
      }).then(r => r.map(j => j.respondentId)),
      ctx.prisma.user.findMany({
        where: {
          won: true,
        },
      }).then(u => u.map(j => j.id)),
    ])

    const possibilities = (Array.from(new Set([...byBooths, ...byWorkshops]))).filter(j => !previousWinners.includes(j))
    if (possibilities.length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No users satisfy condition',
      })
    }

    const number = getRandomIntInclusive(0, possibilities.length - 1)

    return await ctx.prisma.user.update({
      where: {
        id: possibilities[number],
      },
      data: {
        won: true,
      },
    })
  }),
})
