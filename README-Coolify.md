# Deployment to Coolify

- [What gets deployed](#what-gets-deployed)
- [Deploy](#deploy)
- [Users](#users)
- [Use it](#use-it)
- [Run the image locally](#run-the-image-locally)
- [Tradeoffs](#tradeoffs)

This fork serves as the test environment for Ditto ([batch27-flowtomatic](https://github.com/DigitalProductschool/batch27-flowtomatic)). The Node.js variant deploys to Coolify the same way Ditto does: as a **single Docker Compose resource** defined in `docker-compose.prod.yml`.

## What gets deployed

One container runs the CAP server, which serves:

- the two SAP Fiori apps, built into static files;
- the OData services the apps use;
- the same services over [MCP](https://modelcontextprotocol.io) for AI agents, via `@cap-js/mcp`;
- an index page at `/` that lists all of the above.

The deployment consists of these files:

| File | Purpose |
|---|---|
| `Dockerfile` | Builds every app in `app/` and the TypeScript service, and bundles `gen/srv` with the initial data |
| `docker-compose.prod.yml` | The Coolify resource: domain, passwords, healthcheck |
| `srv/mcp.cds` | Serves `TravelService` and `AnalyticsService` over MCP next to OData |
| `srv/server.js` | Forwards the apps' relative OData URLs to the services, and refuses to start if a user has no password |
| `package.json`, `[coolify]` profile | In-memory SQLite, basic authentication with the users below, the index page |

The database is **in-memory SQLite**, loaded from `db/data` on every start (about one second). Every deploy, restart and preview deployment starts from the same data, and whatever testers or agents change is gone after a restart. To reset the data, restart the resource.

## Deploy

1. In Coolify, create a new resource from this repository through the GitHub App, and choose the **Docker Compose** build pack.
2. Set the compose file location to `docker-compose.prod.yml`.
3. After Coolify parses the file, the `sflight` service gets a generated domain (from `SERVICE_FQDN_SFLIGHT_4004`). To use your own, enter it with the container port, for example `https://sflight.my-team.dpschool.app:4004`. The port only tells Coolify where the container listens; the public URL stays on HTTPS.
4. Deploy. Coolify generates a password for each user (`SERVICE_PASSWORD_AMY` and so on). You find them under **Environment Variables**.

**Preview deployments (optional).** They work as in Ditto: with a wildcard DNS record and **Preview Deployments** enabled on the resource, each pull request gets its own instance, with its own passwords and fresh data.

## Users

| User | Roles | Can |
|---|---|---|
| `amy` | `processor` | Everything in Manage Travels |
| `martha` | `reviewer` | Read, accept and reject travels, deduct discounts |
| `rose` | none | Read |
| `agent` | `processor` | The account for AI agents |
| `admin` | `admin` | Everything |

To add a user:

1. Add them to `cds.[coolify].requires.auth.users` in `package.json`. Keep the name lowercase.
2. Add a line for them to `docker-compose.prod.yml`, for example `CDS_REQUIRES_AUTH_USERS_FELIX_PASSWORD=${SERVICE_PASSWORD_FELIX}`.

The server doesn't start if a user has no password.

## Use it

| What | Path |
|---|---|
| Index of apps and endpoints | `/` |
| Manage Travels | `/travel_processor/index.html` |
| Analyze Bookings | `/travel_analytics/index.html` |
| OData | `/processor`, `/analytics` |
| MCP | `/mcp/processor`, `/mcp/analytics` |
| Health | `/health` |

The browser asks for a user and password when an app loads its data.

**Connect an AI agent.** Use an MCP client's HTTP transport with a Basic authentication header. For example, in Claude Code:

```bash
claude mcp add --transport http sflight-travels https://<your-domain>/mcp/processor --header "Authorization: Basic <base64 of agent:password>"
```

Each MCP endpoint gives the agent three tools: `describe` (the data model), `query` (read-only CQL) and `call` (the service's unbound actions and functions). The apps' actions, such as Accept Travel, are bound actions, which MCP doesn't expose. To let an agent change data, add unbound actions to the service. CAP's `@requires` and `@restrict` decide which of them each user's agent sees.

## Run the image locally

Build the image and start it with mocked authentication, where every user logs in with an empty password:

```bash
docker build -t sflight .
```

```bash
docker run --rm -p 4004:4004 -e CDS_REQUIRES_AUTH_KIND=mocked sflight
```

Then open http://localhost:4004.

## Tradeoffs

- No data survives a restart (see above). If a study needs that, switch the `[coolify]` database to a SQLite file on a volume, or to PostgreSQL with `@cap-js/postgres`.
- One container serves everything, so the apps and the services can't be deployed separately.
- The Java variant builds from the same CDS files and hasn't been tested with these changes.
