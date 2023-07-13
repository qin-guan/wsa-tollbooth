# @sagejs/starter-kit

This project is heavily inspired by [@opengovsg/starter-kit](https://github.com/opengovsg/starter-kit), which provides a speedy, but opinionated way for developers to get started building a new service.

I wanted to build something similar, but with a few differences:

* I like Nuxt, so here we are.

By the way, Open Government Products is a great place to work. You should check them out.

## Differences 😿

|                        | `@opengovsg/starter-kit` | `@sagejs/starter-kit`        |
| ---------------------- | ------------------------ | ---------------------------- |
| **Framework**          | NextJS                   | NuxtJS                       |
| **Auth**               | `iron-session`           | h3 (`iron-webcrypto`)        |
| **Sgid**               | Yes!                     | No                           |
| **Mail**               | Postman / Sendgrid       | Resend                       |
| **Package manager**    | NPM 😔                    | PNPM                         doc|
| **UI Library**         | Chakra UI                | PrimeVue                     |
| **Documentation**      | Docusaurus               | VitePress                    |
| **Deployment options** | Vercel                   | Most things, and also Vercel |
| **Logging**            | Winston / Datadog        | Pino (w/ H3) / Axiom         |

### Mail

Unfortunately, my Sendgrid account was suspended seconds after I created it, so... Resend.

### Env validation

Unlike `@opengovsg/starter-kit`, env is handled through Nuxt's runtime configuration feature, instead of using `process.env`.

### Runtimes

RUnning this requires access to a polyfilled or equivalent NodeJS Crypto API. Therefore, it does not work on platforms such as Netlify Edge Functions.

## Boom 💥

Okay, enough hype. Let's get started.

[Continue to the next page](/get-started/prerequisites)
